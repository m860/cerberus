/**
 * @flow
 * @author Jean.h.ma 2020/1/7
 */
import * as React from "react"
import {useCerberus} from "./useCerberus";
import useBundle from "./useBundle";
import instance from "../realm/index"
import BundleSchema from "../realm/bundle.schema"
import {useCache} from "../index";

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
        ...rest
    } = props;

    const {getBundle} = useBundle();
    const {preload} = useCache(rest.cache);

    const bundle = React.useMemo(() => {
        const record = instance.objects(BundleSchema.name).find(f => f.secret === secret);
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
        //update bundle
        if (secret) {
            getBundle(secret)
                .then((result: Bundle) => {
                    instance.write(() => {
                        instance.create(BundleSchema.name, {
                            secret: secret,
                            hash: result.hash,
                            bundles: result.entry
                        }, "all")
                    })
                    //preload
                    preload({
                        secret: secret,
                        queryEntry: queryEntry
                    })
                })
                .catch(ex => {
                    console.log(`fetch bundle fail,${ex.message}`);
                });
        }
        return () => {
            //TODO abort fetch
        }
    }, []);

    return defined;
}
