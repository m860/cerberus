/**
 * @flow
 * @author Jean.h.ma 2020/6/9
 */
import * as React from "react"

const Context = React.createContext<CerberusContext>({
    client: {
        uri: `http://39.99.175.213/graphql`
    }
});

export default Context;
export const CerberusContextProvider = Context.Provider;
