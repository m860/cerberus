/**
 * @flow
 * @author Jean.h.ma 2020/6/1
 *
 * Cache for Async Storage
 *
 */
import * as React from "react"
import useBundle from "./useBundle";
import useUtils from "./useUtils";
import instance from "../realm/index"
import CacheSchema from "../realm/cache.schema"

class CerberusCache<ICerberusCache> {
    get(hash: string) {
        const record = instance.objects(CacheSchema.name)
            .find(f => f.hash === hash);
        return record ? record.code : null;
    }

    set(hash: string, code: string) {
        try {
            instance.beginTransaction();
            instance.create(CacheSchema.name, {
                hash,
                code
            }, "all");
            instance.commitTransaction();
        } catch (ex) {
            console.log("cerberus-cache", `save code fail hash=${hash},${ex.message}`);
            instance.cancelTransaction();
        }
    }

    has(hash: string) {
        const record = instance.objects(CacheSchema.name)
            .find(f => f.hash === hash);
        return !!record;
    }

    remove(hash: string) {
        try {
            instance.beginTransaction();
            const records = instance.objects(CacheSchema.name)
                .filtered(f => f.hash === hash);
            instance.delete(records);
            instance.commitTransaction();
            return true;
        } catch (ex) {
            console.log("cerberus-cache", `remove code fail hash=${hash},${ex.message}`);
            instance.cancelTransaction();
            return false;
        }
    }

    clear() {
        try {
            instance.beginTransaction();
            const all = instance.objects(CacheSchema.name);
            instance.delete(all);
            instance.commitTransaction();
        } catch (ex) {
            console.log("cerberus-cache", `clear cerberus cache fail,${ex.message}`);
            instance.cancelTransaction();
        }
    }
}

const defaultCacheInstance = new CerberusCache();

export default function (cache: ?ICerberusCache): CerberusCacheResult {

    const cacheInstance = cache ? cache : defaultCacheInstance;

    const {getBundle, bundleCount} = useBundle();

    const {download} = useUtils();

    const preload = React.useCallback(async (options: PreloadOptions) => {
        const {
            secret,
            bundleCache,
        } = options;
        console.log("cerberus", `preload ${secret}`);
        // 每次都必须重新拉取最新的bundle
        const result: Bundle = await getBundle(secret);
        const bundle: BundleRecord = {
            secret: secret,
            hash: result.hash,
            bundles: result.entry
        }
        bundleCache.set(bundle)
        if (bundle) {
            const urls: ?Array<string> = bundle.bundles;
            if (urls) {
                // 记录bundle的下载次数
                bundleCount(result.id);

                for (let i = 0; i < urls.length; i++) {
                    const url = urls[i];
                    if (!cacheInstance.has(url)) {
                        const code = await download(url);
                        cacheInstance.set(url, code);
                    } else {
                        console.log("cerberus", `preload ${secret},code is cached ${url}`);
                    }
                }
            }
        }
    }, []);

    return {
        cache: cacheInstance,
        preload
    }
}
