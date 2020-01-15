/**
 * @flow
 * @author Jean.h.ma 2020/1/7
 */
import * as React from "react"
import type {CerberusOption, CerberusResult, CerberusState} from "./useCerberus";
import {CerberusStatusCode, useCerberus} from "./useCerberus";
import client from "../client"
import gql from "graphql-tag"

export type CloudCerberusProps = $Diff<CerberusOption, {| entry: any, debug: any |}> & {
    secret: string
}

export function useCloudCerberus(props: CloudCerberusProps): CerberusResult {
    const {
        secret,
        ...rest
    } = props;


    const [bundle, setBundle] = React.useState<{| entry: ?string, hash: ?string |}>({entry: null, hash: null});
    // const cerberusState = React.useRef<CerberusState>({
    //     status: CerberusStatusCode.prepare,
    //     error: null
    // });
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
            }
        }).then(({data: {bundle}}) => {
            setBundle(bundle);
        }).catch(ex => {
            setStatus(CerberusStatusCode.error, ex);
        })
    }, [secret]);

    return [status, defined, setStatus];
}
