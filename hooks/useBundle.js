/**
 * @flow
 * @author Jean.h.ma 2020/6/1
 */

import {gql} from "apollo-boost";
import useApolloClient from "./useApolloClient";

export default function () {
    const client = useApolloClient();
    return {
        getBundle: (secret: string): Promise<Bundle> => {
            return client.query({
                query: gql`
                    query bundle($secret:String!){
                        bundle(secret:$secret){
                            entry,
                            hash,
                            id
                        }
                    }
                `,
                variables: {
                    secret
                },
                fetchPolicy: 'network-only'
            }).then(({data}) => data.bundle);
        },
        bundleCount: (bundleID: string) => {
            return client.mutate({
                mutation: gql`
                    mutation bundleCount($bundleID){
                        bundleCount(bundleID: $bundleID)
                    }
                `,
                variables: {
                    bundleID,
                }
            })
        }
    }
}
