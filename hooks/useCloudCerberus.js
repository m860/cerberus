/**
 * @flow
 * @author Jean.h.ma 2020/1/7
 */
import * as React from "react"
import type {CerberusOption} from "./useCerberus";
import {useCerberus} from "./useCerberus";
import useBundle from "./useBundle";

export type QueryEntry = (entries: Array<string>)=>string | null;

export const DefaultQueryEntry = (entries: Array<string>): string | null => {
    if (entries && entries.length > 0) {
        return entries[0];
    }
    return null;
};

export type CloudCerberusProps = $Diff<CerberusOption, {| entry: any, debug: any, hash: any |}> & {
    secret: ?string,
    /**
     * 查询需要使用的entry，默认情况返回第一个entry
     */
    queryEntry?: QueryEntry
}

export function useCloudCerberus(props: CloudCerberusProps): Object {
    const {
        secret,
        queryEntry = DefaultQueryEntry,
        ...rest
    } = props;

    const {getBundle} = useBundle();

    const [bundle, setBundle] = React.useState<Bundle>({
        entry: null,
        hash: null
    });

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
        if (secret) {
            getBundle(secret)
                .then((bundle: Bundle) => {
                    setBundle(bundle);
                })
                .catch(ex => {
                    console.log(`fetch bundle fail,${ex.message}`);
                });
        }
        return () => {
            //TODO abort fetch
        }
    }, [secret]);

    return defined;
}
