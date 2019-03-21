/**
 * @overview 小程序的socket事件名称
 * @author jean.h.ma
 */

export const SocketEvents = {
    //小程序版本发生变化
    changed: "applet.changed",
    console: {
        log: "applet.console.log",
        info: "applet.console.info",
        debug: "applet.console.debug",
        warn: "applet.console.warn",
        error: "applet.console.error",
    }
};

export const ConsoleEvent = "REMOTE_CONSOLE";