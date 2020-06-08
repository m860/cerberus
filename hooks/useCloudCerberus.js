/**
 * @flow
 * @author Jean.h.ma 2020/1/7
 */
import * as React from "react"
import {useCerberus} from "./useCerberus";
import {useCache} from "../index";
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
        return queryEntry(bundle && bundle.entry ? bundle.entry : []);
    }, [bundle])

    const defined = useCerberus({
        ...rest,
        entry: url,
        debug: false,
        hash: url || ""
    });

    React.useEffect(() => {
        // preload
        preload({
            secret: secret,
            queryEntry: queryEntry,
            bundleCache: bundleCacheInstance
        })
        return () => {
            //TODO abort fetch
        }
    }, []);

    return defined;
}
