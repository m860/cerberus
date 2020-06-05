/**
 * @flow
 * @author Jean.h.ma 2019-11-25
 *
 * Cerberus Hook
 *
 */

import * as React from "react"
import * as ReactNative from "react-native"
import {useDebug} from "./useDebug";
import useUtils from "./useUtils";
import useCache from "./useCache";

export type CerberusEntry = ?string | ?{ url: string, option?: Object };

export type CerberusOption = {
    /**
     * 入口文件，例如:http://DOMAIN/main.js
     */
    entry: CerberusEntry,
    /**
     * 全局唯一，建议使用content hash
     */
    hash: string,
    /**
     * 备选方案，保证可用性，什么时候会触发备选方案？
     * 1、当本地缓存不可用时
     * 2、当代码编译失败时
     */
    backup: ()=>Object,
    /**
     * 缓存实例，需要实现`ICerberusCache`接口，默认使用存策内存缓存，用户可以自己实现缓略，如果hash为null或者debug=true缓存将不会生效
     */
    cache?: ?ICerberusCache,
    /**
     * 需要注入到小程序的module（自定义modules）
     */
    injectModules?: ()=>Object,
    /**
     * 是否开起debug模式,默认值：false
     */
    debug?: boolean,
};


export function useCerberus(props: CerberusOption): Object {
    const {
        entry,
        injectModules = () => {
        },
        debug = false,
        hash,
        cache: providerCache,
        backup
    } = props;
    // cache instance
    const {cache} = useCache(providerCache);
    const {download} = useUtils();
    const [code, setCode] = React.useState<?string>(null);
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

    const fetchCode = () => {
        if (entry) {
            console.log(`fetch code from ${JSON.stringify(entry)} ...`)
            download(entry)
                .then(value => {
                    return cache.set(hash, value)
                })
                .catch(ex => {
                    console.log(`download ${JSON.stringify(entry)} fail,${ex.message}`);
                })
        }
    }

    React.useEffect(() => {
        (async () => {
            if (debug) {
                try {
                    const value = await download(entry);
                    setCode(value);
                } catch (ex) {
                    console.log(`download ${JSON.stringify(entry)} fail,${ex.message}`);
                }
            } else {
                const cacheCode: ?string = await cache.get(hash);
                if (cacheCode && code !== cacheCode) {
                    setCode(cacheCode);
                } else {
                    // fetch code
                    fetchCode();
                }
            }
        })();
        return () => {
            //TODO abort fetch
        }
    }, [entry, lastUpdateDate, hash]);

    const defined = React.useMemo<any>(() => {
        if (code) {
            try {
                // $FlowFixMe
                return (new Function(`$REACT$`, `$REACTNATIVE$`, `$MODULES$`, `${code} return __exps__`))(React, ReactNative, {
                    ...injectModules(),
                    __BASE_URL__: baseURL
                });
            } catch (ex) {
                console.log(`code compile fail : ${ex.message}`);
            }
        } else {
            console.log(`use backup, code=${JSON.stringify(code)}`)
            return backup();
        }
    }, [code]);

    return defined;
}
