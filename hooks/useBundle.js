/**
 * @flow
 * @author Jean.h.ma 2020/6/1
 */

import {gql} from "apollo-boost";
import useApolloClient from "./useApolloClient";

function getBundle(secret: string): Promise<Bundle> {
    const client = useApolloClient();
    return client.query({
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
    }).then(({data}) => data.bundle);
}

export default function () {
    return {
        getBundle
    }
}
