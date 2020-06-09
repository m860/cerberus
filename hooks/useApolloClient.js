/**
 * @flow
 * @author Jean.h.ma 2020/6/9
 */
import * as React from "react"
import Context from "../components/CerberusContextProvider"

export default function () {
    const context = React.useContext(Context);
    return context.client;
}
