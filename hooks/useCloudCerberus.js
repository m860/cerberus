/**
 * @flow
 * @author Jean.h.ma 2020/1/7
 */
import * as React from "react"
import {useCerberus} from "./useCerberus";
import useCache from "./useCache";
import useBundleCache from "./useBundleCache";


export const DefaultQueryEntry = (entries: Array<string>): string | null => {
    if (entries && entries.length > 0) {
        return entries[0];
    }
    return null;
};

export function useCloudCerberus(props: CloudCerberusProps): Object {
    const {
        secret,
        queryEntry = DefaultQueryEntry,
        bundleCache,
        debug = false,
        debugEntry,
        ...rest
    } = props;

    const {cache: bundleCacheInstance} = useBundleCache(bundleCache)
    const {preload} = useCache(rest.cache);

    const bundle = React.useMemo(() => {
        const record = bundleCacheInstance.get(secret);
        if (record) {
            return {
                entry: record.bundles,
                hash: record.hash
            }
        }
        return {
            entry: null,
            hash: null
        }
    }, [])

    const url: ?string = React.useMemo(() => {
        if (debug) {
            return debugEntry;
        }
        return queryEntry(bundle && bundle.entry ? bundle.entry : []);
    }, [bundle, debug])

    const defined = useCerberus({
        ...rest,
        entry: url,
        debug: debug,
        hash: url || secret
    });

    React.useEffect(() => {
        if (debug) {
            // preload
            preload({
                secret: secret,
                bundleCache: bundleCacheInstance
            })
        }
        return () => {
            //TODO abort fetch
        }
    }, [debug]);

    return defined;
}
