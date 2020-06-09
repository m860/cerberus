/**
 * @flow
 * @author Jean.h.ma 2020/6/9
 */
import * as React from "react"
import ApolloClient from "apollo-boost";

const Context = React.createContext<CerberusContext>({
    client: new ApolloClient({
        uri: `http://39.99.175.213/graphql`,
        fetch: fetch
    })
});

export default Context;
export const CerberusContextProvider = Context.Provider;
