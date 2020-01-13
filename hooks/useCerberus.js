/**
 * @flow
 * @author Jean.h.ma 2019-11-25
 * @TODO 在debug环境下实现reload
 *
 * Cerberus Hook
 *
 */

import * as React from "react"
import * as ReactNative from "react-native"
import {useDebug} from "./useDebug";

/**
 * 状态
 */
export const CerberusStatusCode = {
    // 准备
    prepare: "prepare",
    // 下载中
    downloading: "downloading",
    // 编译中
    compiling: "compiling",
    // 错误
    error: "error",
    // 成功
    success: "success"
};

export type CerberusState = {
    status: $Values<typeof CerberusStatusCode>,
    error: ?Error
};

export type CerberusOption = {
    /**
     * 入口文件，例如:http://DOMAIN/main.js
     */
    entry: ?string
        | ?{ url: string, option?: Object },
    /**
     * 需要注入到小程序的module
     */
    injectModules?: ()=>Object,
    /**
     * 默认需要执行的代码
     */
    defaultCode?: string,
    /**
     * 是否开起debug模式,默认值：false
     */
    debug?: boolean
};

export type CerberusResult = [CerberusState, any];

export function useCerberus(option: CerberusOption): CerberusResult {
    const {
        entry,
        injectModules = () => {
        },
        defaultCode = null,
        debug = false
    } = option;
    const [code, setCode] = React.useState<?string>(defaultCode);
    const status = React.useRef<CerberusState>({status: CerberusStatusCode.prepare});
    const baseURL: string = React.useMemo(() => {
        const index = entry.lastIndexOf("/");
        return entry.substring(0, index + 1);
    }, [entry]);
    const lastUpdateDate = useDebug(debug, baseURL);

    const setStatus = React.useCallback((s: $Values<typeof CerberusStatusCode>, ex?: ?Error) => {
        status.current.status = s;
        status.current.error = ex;
    }, []);

    React.useEffect(() => {
        if (entry) {
            setStatus(CerberusStatusCode.downloading);
            const url = typeof entry === "string" ? entry : entry.url;
            const option = typeof entry === "string" ? null : entry.option;
            fetch(url, option)
                .then(res => res.text())
                .then(text => {
                    if (code !== text) {
                        setCode(text);
                    } else {
                        // 如果代码没有变化，则将状态修改为success
                        setStatus(CerberusStatusCode.success);
                    }
                })
                .catch(ex => {
                    setStatus(CerberusStatusCode.error, ex);
                })
        }
    }, [entry, lastUpdateDate]);

    const defined = React.useMemo<any>(() => {
        let result = null;
        if (code) {
            try {

                result = (new Function(`$REACT$`, `$REACTNATIVE$`, `$MODULES$`, `${code} return __exps__`))(React, ReactNative, {
                    ...injectModules(),
                    __BASE_URL__: baseURL
                });
                setStatus(CerberusStatusCode.success);
            } catch (ex) {
                setStatus(CerberusStatusCode.error, ex);
            }
        }
        return result;
    }, [code]);

    return [status, defined]
}
