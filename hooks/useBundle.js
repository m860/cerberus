/**
 * @flow
 * @author Jean.h.ma 2020/6/1
 */

import {gql} from "apollo-boost";
import * as React from "react"
import Context from "../components/CerberusContextProvider";
import ApolloClient from "apollo-boost";

export default function () {
    const context = React.useContext(Context);
    const client = new ApolloClient({
        fetch: fetch,
        ...context.client
    });
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
                    mutation bundleCount($bundleID:String){
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
