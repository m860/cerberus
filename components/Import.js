import {exportAllModules} from "./Utils";
import type {AppletOption} from "./Types";

/**
 * Import - 导入小程序组件
 * @alias Import
 * @param module - 需要require或者import的module
 * @param option - 配置信息,不需要提供,由系统决定
 * @returns {*}
 *
 * @example
 *
 * export default function(React,ReactNative,Modules){
 *     const {Import}=Modules;
 *
 *     const CustomComponent=Import(require("xxx.js"));
 *
 *     ...
 * }
 * @author jean.h.ma
 */
export default function (module: Function | Object, option: AppletOption & { exportModules: Function }): any {
    const factory = (module && module.default) ? module.default : module;
    if (typeof factory !== "function") {
        throw new Error(`Import失败,请参考API文档`);
    }
    return factory(...exportAllModules(option));
}