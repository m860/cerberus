/**
 * @flow
 * @author Jean.h.ma 2019-11-25
 *
 * Cerberus Hook
 *
 */

import * as React from "react"
import * as ReactNative from "react-native"

/**
 * 状态
 */
export const CerberusStatusCode = {
    // 准备
    prepare: 0,
    // 下载中
    downloading: 10,
    // 编译中
    compiling: 20,
    // 错误
    error: 90,
    // 成功
    success: 100
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
    defaultCode?: string
};

export type CerberusResult = [CerberusState, any];

export function useCerberus(option: CerberusOption): CerberusResult {
    const {
        entry,
        injectModules,
        defaultCode = null
    } = option;
    const [code, setCode] = React.useState<?string>(defaultCode);
    const status = React.useRef<CerberusState>({status: CerberusStatusCode.prepare});

    const setStatus = React.useCallback((s: $Values<typeof CerberusStatusCode>, ex?: ?Error = null) => {
        status.current.status = s;
        status.current.error = ex;
    }, []);

    React.useEffect(() => {
        if (entry) {
            setStatus(CerberusStatusCode.downloading);
            status.current.status = CerberusStatusCode.downloading;
            const url = typeof entry === "string" ? entry : entry.url;
            const option = typeof entry === "string" ? null : entry.option;
            fetch(url, option)
                .then(res => res.text())
                .then(text => {
                    if (code !== text) {
                        setCode(text);
                    }
                })
                .catch(ex => {
                    setStatus(CerberusStatusCode.error, ex);
                })
        }
    }, [entry]);

    const defined = React.useMemo<any>(() => {
        let result = null;
        if (code) {
            try {
                result = (new Function(`$REACT$`, `$REACTNATIVE$`, `$MODULES$`, `return ${code}`))(React, ReactNative, {
                    ...injectModules()
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