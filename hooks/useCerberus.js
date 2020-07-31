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
    const [code, setCode] = React.useState<?string>(() => {
        return cache.get(hash);
    });
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
            download(entry)
                .then(value => {
                    cache.set(hash, value)
                })
                .catch(ex => {
                    console.log("cerberus", `download ${JSON.stringify(entry)} fail,${ex.message}`);
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
                    console.log("cerberus", `download ${JSON.stringify(entry)} fail,${ex.message}`);
                }
            } else {
                // 如果没有缓存，就拉取最新代码进行缓存
                if (!cache.has(hash)) {
                    // fetch code
                    fetchCode();
                } else if (!code) {
                    // 如果有缓存但是code又没有值，说明是使用的Cloud模式，需要重新从缓存中恢复数据
                    setCode(cache.get(hash));
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
                    __BASE_URL__: baseURL,
                    // 解析资源
                    resolveAsset: (url: string) => {
                        return {
                            uri: baseURL + url
                        }
                    }
                });
            } catch (ex) {
                console.log("cerberus", `code compile fail : ${ex.message}`);
            }
        } else {
            console.log("cerberus", `${debug ? "[debug]" : ""}hash(${hash || ""}) use backup`)
        }
        return backup();
    }, [code]);

    return defined;
}
