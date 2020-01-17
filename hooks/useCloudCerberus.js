/**
 * @flow
 * @author Jean.h.ma 2020/1/7
 */
import * as React from "react"
import type {CerberusOption, CerberusResult} from "./useCerberus";
import {CerberusStatusCode, useCerberus} from "./useCerberus";
import {getBundle} from "../libs/services"
import type {Bundle} from "../libs/services";

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

export function useCloudCerberus(props: CloudCerberusProps): CerberusResult {
    const {
        secret,
        queryEntry = DefaultQueryEntry,
        ...rest
    } = props;


    const [bundle, setBundle] = React.useState<Bundle>({
        entry: null,
        hash: null
    });

    const url: ?string = React.useMemo(() => {
        return queryEntry(bundle && bundle.entry ? bundle.entry : []);
    }, [bundle])

    const [status, defined, setStatus] = useCerberus({
        ...rest,
        entry: url,
        debug: false,
        hash: bundle.hash && url ? bundle.hash + url : null
    });

    React.useEffect(() => {
        if (secret) {
            getBundle(secret)
                .then((bundle: Bundle) => {
                    setBundle(bundle);
                }).catch(ex => {
                setStatus(CerberusStatusCode.error, ex);
            });
        }
        return () => {
            //TODO abort fetch
        }
    }, [secret]);

    return [status, defined, setStatus];
}
