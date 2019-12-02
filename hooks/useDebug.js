/**
 * @flow
 * @author Jean.h.ma 2019-12-02
 */
import * as React from "react"
import io from "socket.io-client"
import type {Manager, Socket} from "socket.io-client"

const KEY_WEBPACK_COMPILE_SUCCESS = "WEBPACK_COMPILE_SUCCESS";

export function useDebug(debug: boolean, url: string): number {

    const [lastUpdateDate, setLastUpdateDate] = React.useState<number>(Date.now());

    React.useEffect(() => {
        let socket: ?Socket = null;
        const webpackCompileSuccess = () => {
            setLastUpdateDate(Date.now());
        }
        if (debug) {
            socket = io(url, {forceNew: true});
            socket.on(KEY_WEBPACK_COMPILE_SUCCESS, webpackCompileSuccess)
        }
        return () => {
            if (socket) {
                socket.off(KEY_WEBPACK_COMPILE_SUCCESS, webpackCompileSuccess);
                if (socket.connected) {
                    socket.close()
                }
                socket.destroy();
            }
        }
    }, [debug, url]);

    return lastUpdateDate;
}