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

    const {getBundle} = useBundle();

    const {download} = useUtils();

    const preload = React.useCallback(async (options: PreloadOptions) => {
        const {
            secret,
            bundleCache,
            queryEntry
        } = options;
        console.log("cerberus", `preload ${secret}`);
        let bundle: ?BundleRecord = bundleCache.get(secret);
        if (!bundle) {
            const result: Bundle = await getBundle(secret);
            bundle = {
                secret: secret,
                hash: result.hash,
                bundles: result.entry
            }
            bundleCache.set(bundle)
        } else {
            console.log("cerberus", `preload ${secret},bundle is cached`);
        }
        if (bundle) {
            const entry: ?Array<string> = bundle.bundles;
            if (entry) {
                const url: ?string = options.queryEntry ? options.queryEntry(entry) : null;
                if (url) {
                    // 没有缓存才进行下载
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
