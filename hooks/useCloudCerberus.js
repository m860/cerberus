/**
 * @flow
 * @author Jean.h.ma 2020/1/7
 */
import * as React from "react"
import type {CerberusOption, CerberusResult} from "./useCerberus";
import {CerberusStatusCode, useCerberus} from "./useCerberus";
import client from "../libs/client"
import {gql} from "apollo-boost"

export type CloudCerberusProps = $Diff<CerberusOption, {| entry: any, debug: any, hash: any |}> & {
    secret: ?string,
    /**
     * 查询需要使用的entry，默认情况返回第一个entry
     */
    queryEntry?: (entries: Array<string>)=>string | null
}

export function useCloudCerberus(props: CloudCerberusProps): CerberusResult {
    const {
        secret,
        queryEntry = (entries: Array<string>): string | null => {
            if (entries && entries.length > 0) {
                return entries[0];
            }
            return null;
        },
        ...rest
    } = props;


    const [bundle, setBundle] = React.useState<{| entry: Array<string> | null, hash: ?string |}>({
        entry: null,
        hash: null
    });
    const [status, defined, setStatus] = useCerberus({
        ...rest,
        entry: queryEntry(bundle && bundle.entry ? bundle.entry : []),
        debug: false,
        hash: bundle.hash
    });

    React.useEffect(() => {
        if (secret) {
            // get entry with secret
            client.query({
                query: gql`
                    query bundle($secret:String!){
                        bundle(secret:$secret){
                            entry,
                            hash
                        }
                    }
                `,
                variables: {
                    secret
                },
                fetchPolicy: 'network-only'
            }).then(({data: {bundle}}) => {
                setBundle(bundle);
            }).catch(ex => {
                setStatus(CerberusStatusCode.error, ex);
            });
        }
    }, [secret]);

    return [status, defined, setStatus];
}
