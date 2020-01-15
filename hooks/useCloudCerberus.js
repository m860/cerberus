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
    secret: string
}

export function useCloudCerberus(props: CloudCerberusProps): CerberusResult {
    const {
        secret,
        ...rest
    } = props;


    const [bundle, setBundle] = React.useState<{| entry: ?string, hash: ?string |}>({entry: null, hash: null});
    const [status, defined, setStatus] = useCerberus({
        ...rest,
        entry: bundle.entry,
        debug: false,
        hash: bundle.hash
    });

    React.useEffect(() => {
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
        })
    }, [secret]);

    return [status, defined, setStatus];
}
