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
import Realm from 'realm';

const CerberusCacheSchema = {
    name: 'cerberus-cache',
    primaryKey: 'hash',
    properties: {
        hash: 'string',
        code: 'string'
    },
};

const instance = new Realm({
    path: 'cerberus-cache.realm',
    schema: [CerberusCacheSchema],
    schemaVersion: 1,
});

class CerberusCache<ICerberusCache> {
    get(hash: string) {
        const record = instance.objects(CerberusCacheSchema.name)
            .find(f => f.hash === hash);
        return record ? record.code : null;
    }

    set(hash: string, code: string) {
        try {
            instance.beginTransaction();
            instance.create(CerberusCacheSchema.name, {
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
        const record = instance.objects(CerberusCacheSchema.name)
            .find(f => f.hash === hash);
        return !!record;
    }

    remove(hash: string) {
        try {
            instance.beginTransaction();
            const records = instance.objects(CerberusCacheSchema.name)
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
            const all = instance.objects(CerberusCacheSchema.name);
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
        const bundle: Bundle = await getBundle(options.secret);
        const entry: ?Array<string> = bundle.entry;
        if (entry) {
            const url: ?string = options.queryEntry ? options.queryEntry(entry) : null;
            if (url) {
                const code = await download(url);
                cacheInstance.set(url, code);
            }
        }
        return null;
    }, []);

    return {
        cache: cacheInstance,
        preload
    }
}
