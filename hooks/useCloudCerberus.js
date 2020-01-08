/**
 * @flow
 * @author Jean.h.ma 2020/1/7
 */
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


    const [entry, setEntry] = React.useState(null);
    const cerberusState = React.useRef<CerberusState>({
        status: CerberusStatusCode.prepare,
        error: null
    });

    React.useEffect(() => {
        //TODO get entry with secret
        client.query({
            query: gql`
                query bundle($secret:String!){
                    bundle(secret:$secret){
                        entry
                    }
                }
            `
        }).then(({data: {bundle}}) => {
            setEntry(bundle.entry);
        }).catch(ex => {
            cerberusState.current = {
                status: CerberusStatusCode.error,
                error: ex
            }
        })
    }, [secret]);

    if (!entry) {
        return [cerberusState.current, null];
    }
    return useCerberus({
        ...rest,
        entry,
        debug: false
    })
}