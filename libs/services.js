/**
 * @flow
 * @author Jean.h.ma 2020/1/7
 */
import ApolloClient from 'apollo-boost/lib/index';
import {gql} from "apollo-boost";

const client = new ApolloClient({
    uri: `http://39.99.175.213/graphql`,
    fetch: fetch
});

export function getBundle(secret: string): Promise<Bundle> {
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

export type Bundle = {
    hash: ?string,
    entry: ?Array<string>
};
