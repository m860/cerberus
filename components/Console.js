import Emitter from "./Emitter";
import {SocketEvents, ConsoleEvent} from "./Events";
import type {AppletOption} from "./Types";

/**
 * 小程序远程调试模块,如果是在生产环境将不会输出任何内容.建议在部署到生产环境之前删除Console代码(不删除也不影响)
 * @class
 * @name Console
 * @author jean.h.ma
 *
 * @example
 *
 * export default function(React,ReactNative,Modules){
 *     const {Console}=Modules;
 *     return class ConsoleTest extends React.Component{
 *         render(){
 *             return null;
 *         }
 *         componentDidMount(){
 *             Console.log("test console.log");
 *         }
 *     }
 * }
 *
 */
export default class AppletConsole {

    constructor(option: AppletOption) {
        this._option = option;
    }

    /**
     * 输出debug
     * @param message
     */
    debug(message: any): void {
        if (this._option.debug) {
            Emitter.emit(ConsoleEvent, {
                name: SocketEvents.console.debug,
                data: JSON.stringify(message),
                type: "debug"
            });
        }
    }

    /**
     * 输出log
     * @param message
     */
    log(message: any): void {
        if (this._option.debug) {
            Emitter.emit(ConsoleEvent, {
                name: SocketEvents.console.log,
                data: JSON.stringify(message),
                type: "log"
            });
        }
    }

    /**
     * 输出info
     * @param message
     */
    info(message: any): void {
        if (this._option.debug) {
            Emitter.emit(ConsoleEvent, {
                name: SocketEvents.console.info,
                data: JSON.stringify(message),
                type: "info"
            });
        }
    }

    /**
     * 输出warn
     * @param message
     */
    warn(message: any): void {
        if (this._option.debug) {
            Emitter.emit(ConsoleEvent, {
                name: SocketEvents.console.warn,
                data: JSON.stringify(message),
                type: "warn"
            });
        }
    }

    /**
     * 输出error
     * @param message
     */
    error(message: any): void {
        if (this._option.debug) {
            Emitter.emit(ConsoleEvent, {
                name: SocketEvents.console.error,
                data: JSON.stringify(message),
                type: "error"
            });
        }
    }
}