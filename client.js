/**
 * @flow
 * @author Jean.h.ma 2020/1/7
 */
import ApolloClient from 'apollo-boost/lib/index';

export default new ApolloClient({
    uri: `http://39.99.175.213/graphql`,
    fetch: fetch
});