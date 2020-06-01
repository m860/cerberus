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
import useUtils from "./useUtils";
import useCache from "./useCache";

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
    status: $Keys<typeof CerberusStatusCode>,
    error: ?Error
};

export type CerberusEntry = ?string | ?{ url: string, option?: Object };

export type CerberusOption = {
    /**
     * 入口文件，例如:http://DOMAIN/main.js
     */
    entry: CerberusEntry,
    /**
     * 全局唯一，建议使用content hash
     */
    hash: ?string,
    /**
     * 缓存实例，需要实现`ICerberusCache`接口，默认使用存策内存缓存，用户可以自己实现缓略，如果hash为null或者debug=true缓存将不会生效
     */
    cache?: ?ICerberusCache,
    /**
     * 需要注入到小程序的module（自定义modules）
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

export type CerberusResult = [
    // 当前cerberus状态
    { current: CerberusState | null },
    any,
    Function
];

export function useCerberus(props: CerberusOption): CerberusResult {
    const {
        entry,
        injectModules = () => {
        },
        defaultCode = null,
        debug = false,
        hash,
        cache: providerCache
    } = props;
    // cache instance
    const {cache} = useCache(providerCache);
    const {download} = useUtils();
    const [code, setCode] = React.useState<?string>(defaultCode);
    const status = React.useRef<CerberusState>({status: CerberusStatusCode.prepare, error: null});
    const baseURL: string = React.useMemo(() => {
        if (entry) {
            let url: ?string = null;
            if (typeof entry === "string") {
                url = entry;
            } else if (entry.url) {
                url = entry.url;
            }
            if (url) {
                const index = url.lastIndexOf("/");
                return url.substring(0, index + 1);
            }
        }
        return "";
    }, [entry]);
    const lastUpdateDate = useDebug(debug, baseURL);

    const setStatus = React.useCallback((s: $Values<typeof CerberusStatusCode>, ex?: ?Error) => {
        if (status.current) {
            status.current.status = s;
            status.current.error = ex;
        }
    }, []);

    React.useEffect(() => {
        (async () => {
            if (!debug && hash && cache) {
                const cacheCode: ?string = await cache.get(hash);
                if (cacheCode) {
                    if (code !== cacheCode) {
                        setCode(cacheCode);
                        return;
                    }
                }
            }
            if (entry) {
                setStatus(CerberusStatusCode.downloading);
                try {
                    const text = await download(entry);
                    if (code !== text) {
                        setCode(text);
                        if (hash && cache) {
                            await cache.set(hash, text);
                        }
                    } else {
                        // 如果代码没有变化，则将状态修改为success
                        setStatus(CerberusStatusCode.success);
                    }
                } catch (ex) {
                    setStatus(CerberusStatusCode.error, ex);
                }
            }
        })();
        return () => {
            //TODO abort fetch
        }
    }, [entry, lastUpdateDate, hash]);

    const defined = React.useMemo<any>(() => {
        let result = null;
        if (code) {
            try {
                // $FlowFixMe
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

    return [status, defined, setStatus]
}
