/**
 * @flow
 * @author Jean.h.ma 2019-08-19
 *
 * 小程序状态的处理
 * 开始访问小程序，如果加载时间超过了500ms（暂定）就显示加载的loading，否则不显示
 *
 * @TODO 省略代码编译的步骤，使用require绝对路径的方式来实现代码的动态加载
 * @TODO 小程序使用的Modules应该是单实例
 *
 */
import * as React from "react"
import * as ReactNative from "react-native"
import RNFetchBlob from "rn-fetch-blob";
import {SocketConnect, SocketEvent} from "react-socket-io-client";
import ErrorHandler from "./ErrorHandler";
import {unzip} from "react-native-zip-archive";

const EntryName = "main.js";
const CodeChangeEventName = "CODE_CHANGE";

/**
 * 默认小程序缓存的位置
 */
export const AppletCacheDir = RNFetchBlob.fs.dirs.CacheDir + "/applets";

export type AppletOption = {
    /**
     * 小程序访问地址
     * 当是生产环境时，这里应该传入小程序包的下载地址，如：http://xxxx/demo.cbs
     * 当是开发时，这里应该传入小程序的入口文件，如：http://xxxx/main.js
     *
     * NOTE:
     * 小程序中其他资源文件的访问规则：
     * 开发环境：如果入口文件是http://xxxx/main.js,则资源将在目录http://xxxx/下面进行查找
     * 生产环境会在入口文件缓存的文件夹下进行查找
     *
     * NOTE: 小程序的入口文件是固定死的，main.js
     *
     * */
    url: string,
    /**
     * 小程序当前版本的hash值
     * */
    hash: string,
    // /**
    //  * 是否是调试模式，默认值：false
    //  * */
    // debug?: boolean,
    // /**
    //  * 入口文件。默认值是：main.js
    //  * */
    // entry?: string,
    // /**
    //  * 渲染类型，默认值：0，即使用react-native的方式进行渲染
    //  * */
    // renderType?: $Values<typeof RenderType>
};

/**
 * 是否是调试
 */
function isDebug(option: AppletOption): boolean {
    const {url} = option;
    return /\.js$/.test(url);
}

/**
 * 下载小程序
 */
function downloadAppletCode(
    option: AppletOption,
    downloadProgress?: (received: number, total: number)=>any,
): Promise<?string> {
    const {url, hash} = option;
    if (isDebug(option)) {
        return RNFetchBlob.fetch("GET", url)
            .progress(downloadProgress)
            .then(res => {
                const status = res.info().status;
                if (status === 200) {
                    return res.text();
                }
                return Promise.reject(`download fail from ${url}, status=${status}`);
            })
    }

    const zip = `${AppletCacheDir}/${hash}.zip`;
    return RNFetchBlob.config({
        path: zip
    }).fetch("GET", url)
        .then(res => {
            const status = res.info().status;
            if (status === 200) {
                const unzipDir = `${AppletCacheDir}/${hash}`
                return unzip(zip, unzipDir)
                    .then(path => {
                        //删除zip文件
                        RNFetchBlob.fs.unlink(zip).catch(() => null);
                        const entry = `${unzipDir}/main.js`
                        return RNFetchBlob.fs.readFile(entry, "utf8")
                            .then(text => {
                                if (typeof text === "string") {
                                    return text;
                                }
                                return Promise.reject(`file content is not string`);
                            })
                    })
            }
            return Promise.reject(`download fail from ${url}, status=${status}`);
        })
}

function compile(
    code: ?string,
    /**
     * 公共模块重定向
     */
    cbs: (moduleName: string)=>any
): Promise<any> {
    if (!code) {
        return Promise.reject(new Error(`compile fail, code is null`));
    }
    /**
     *
     * import React from "react"
     * import {Text} from "react-native"
     *
     * export default function (){
     *     return <Text>demo</Text>
     * }
     *
     * 编译后生成生成的代码大致如下：
     * const React=__cbs__("react")
     * const {Text}=__cbs__("react-native")
     * const modules=__cbs__("@cerberus/modules")
     * export default function (){
     *     return <Text>demo</Text>
     * }
     */
    return new Promise((resolve, reject) => {
        try {
            const result = new Function("__cbs__", code).apply(this, [cbs])
            resolve(result);
        } catch (ex) {
            reject(ex);
        }
    })
    // try {
    //     createAppletExecutable(code, {
    //         __AppletRequire: (moduleName: string) => {
    //             const allModules = exportAllModules({
    //                 ...option,
    //                 exportModules,
    //                 rootDir,
    //                 parentNavigation
    //             });
    //             switch (moduleName) {
    //                 case 'react': {
    //                     return allModules[0];
    //                 }
    //                 case 'react-native': {
    //                     return allModules[1];
    //                 }
    //                 case '@ibuild-community/applet': {
    //                     return allModules[2];
    //                 }
    //             }
    //         }
    //     }).exec(this);
    //
    //     // $FlowFixMe
    //     const creator = this._createApplet;
    //     //TODO 这个检查可以放在CLI中进行实现
    //     if (creator && typeof creator === "function") {
    //         if (creator.metadata && creator.metadata.buildType === "normal") {
    //             return creator;
    //         } else {
    //             return creator(...exportAllModules({
    //                 ...option,
    //                 exportModules,
    //                 rootDir,
    //                 parentNavigation
    //             }));
    //         }
    //     } else {
    //         compileError && compileError(new Error("小程序的入口必须是一个函数"));
    //     }
    // } catch (ex) {
    //     compileError && compileError(ex);
    // }
}

/**
 * 从缓存获取小程序
 */
export function getCache(option: AppletOption): Promise<?string> {
    const entry = `${AppletCacheDir}/${option.hash}/${EntryName}`
    return RNFetchBlob.fs.exists(entry)
        .then(exists => {
            if (exists) {
                return RNFetchBlob.fs.readFile(entry, "utf8")
                    .then(text => {
                        if (typeof text === "string") {
                            return text;
                        }
                        return null;
                    })
            }
            return null;
        })
}

/**
 * useApplet的返回值
 */
export type UseAppletResult = [?Error, any];

/**
 * applet hooks
 * @todo 处理小程序缓存
 * @todo 退出小程序时，如果小程序没有下载完成取消下载
 */
function useApplet(
    option: AppletOption,
    cbs: (moduleName: string)=>any,
    deps?: Array<*> = [],
    downloadProgress?: (received: number, total: number)=>any,
): UseAppletResult {

    const [content, setContent] = React.useState<UseAppletResult>([null, null]);

    React.useEffect(async () => {
        try {
            let code = await getCache(option);
            if (!code) {
                code = await downloadAppletCode(option, downloadProgress);
            }
            if (code) {
                const result = await compile(code, cbs);
                setContent([null, result]);
            } else {
                setContent([new Error(`code is null`), null])
            }
        } catch (ex) {
            setContent([ex, null])
        }
    }, deps);

    return content;
}

// function downloadDebugApplet(
//     props: AppletOption,
//     rootDir: string = AppletCacheDir,
//     downloadProgress?: (received: number, total: number)=>any,
//     downloadSuccess?: (code: string)=>any,
//     downloadError?: (error: any)=>any
// ): StatefulPromise<*> {
//     const url = getDebugAppletEntryUrl(props);
//     const request: StatefulPromise<*> = RNFetchBlob.config({
//         path: getAppletEntryFile({...props, rootDir})
//     }).fetch("GET", url);
//
//     if (downloadProgress) {
//         request.progress(downloadProgress);
//     }
//
//     request.then((res) => {
//         const status = res.respInfo.status;
//         if (status === 200) {
//             res.readFile("utf8").then(text => {
//                 downloadSuccess && downloadSuccess(text);
//             }).catch(err => {
//                 downloadError && downloadError(err);
//             });
//         } else {
//             downloadError && downloadError(new Error(`小程序下载失败：url=${url},status=${status}`));
//         }
//     })
//         .catch((err) => {
//             downloadError && downloadError(err);
//         });
//
//     return request;
// }
//
// export function downloadApplet(
//     option: AppletOption,
//     rootDir: string = AppletCacheDir,
//     downloadProgress?: (received: number, total: number)=>any,
//     downloadSuccess?: (code: string)=>any,
//     downloadError?: (error: any)=>any
// ): StatefulPromise<*> {
//     const url = getAppletPackageUrl(option);
//     const packageFilePath = `${rootDir}/${option.secretKey}/${option.hash}.zip`;
//     const unzipPackageFilePath = `${rootDir}/${option.secretKey}/${option.hash}`;
//
//     const request: StatefulPromise<*> = RNFetchBlob.config({
//         path: packageFilePath
//     }).fetch("GET", url);
//
//     if (downloadProgress) {
//         request.progress(downloadProgress);
//     }
//
//     request.then((res) => {
//         const status = res.respInfo.status;
//         if (status === 200) {
//             return unzip(packageFilePath, unzipPackageFilePath).then((path) => {
//                 //删除zip文件
//                 RNFetchBlob.fs.unlink(packageFilePath).catch(() => null);
//                 const enterPath = getAppletEntryFile({...option, rootDir});
//                 return RNFetchBlob.fs.readFile(enterPath, "utf8").then(text => {
//                     if (typeof text === "string") {
//                         downloadSuccess && downloadSuccess(text);
//                     } else {
//                         downloadError && downloadError(new Error(`文件内容必须是字符串`));
//                     }
//                 }).catch(err => downloadError && downloadError(err));
//             }).catch((err) => {
//                 downloadError && downloadError(err);
//             });
//         } else {
//             downloadError && downloadError(new Error(`小程序下载失败：url=${url},status=${status}`));
//         }
//     }).catch(err => downloadError && downloadError(err));
//
//     return request;
// }

// function createAppletExecutable(code: string, scope = {}): { exec: (self: any)=>any } {
//     const scopeKeys = Object.keys(scope);
//     // $FlowFixMe
//     const appletExecutable = new Function(...scopeKeys, code);
//     return {
//         exec(self: any) {
//             appletExecutable.apply(self, scopeKeys.map(key => scope[key]));
//         }
//     }
// }


export function hasCache(option: AppletOption): Promise<boolean> {
    const path = `${AppletCacheDir}/${option.hash}`;
    return RNFetchBlob.fs.exists(path)
        .then((exist) => exist)
        .catch(() => false);
}

export type AppletProps = {
    /**
     * 小程序配置参数
     */
    option: AppletOption,
    // parent navigation
    navigation: any,
    /**
     * 用于socket连接
     */
    id?: string,
    // // 小程序存储位置
    // rootDir?: string,
    /**
     * 导出小程序额外的modules,只需要导出小程序中自定义的modules,React和ReactNative已经自动导出
     */
    extraModules?: () => Object,
    /**
     * 小程序的初始化props
     */
    initialProps?: Object,
    /**
     * 小程序状态变化
     */
    onStatusChange?: ()=>any,
    /**
     * 错误处理
     */
    onError?: (err: Error)=>any
}

function Applet(props: Props) {
    const {
        option,
        navigation,
        id = Date.now().toString(),
        // rootDir = AppletCacheDir,
        extraModules = () => {
        },
        initialProps = {},
        onStatusChange,
        onError = () => null
    } = props;

    /**
     * 日志模块
     * @TODO 重新实现log输出
     */
    const log = React.useCallback(() => {

    }, []);

    /**
     * 小程序自定义modules
     */
    const appletModules = React.useMemo(() => {
        return {
            ...extraModules(),
            log
        }
    }, []);

    /**
     * 公共模块导出
     */
    const cbs = React.useCallback((moduleName: string) => {
        switch (moduleName) {
            case "react":
                return React;
            case "react-native":
                return ReactNative;
            default:
                return appletModules
        }
    }, []);

    const [hash, setHash] = React.useState<?string>(null);
    const [err, AppletContent] = useApplet(option, cbs, [hash]);

    // 错误处理
    React.useEffect(() => {
        if (err) {
            onError(err);
        }
    }, [err]);

    const socketRef = React.useRef<SocketConnect>();
    const getSocketInstance = () => {
        if (socketRef && socketRef.current) {
            return socketRef.current.getSocketInstance();
        }
        return null;
    };


    React.useEffect(() => {
        // //#region debug时，监听调试信息的console
        // let listeners = [];
        // if (debug) {
        //     listeners.push(
        //         Emitter.addListener(ConsoleEvent, ({name, data, type}) => {
        //             const ins = getSocketInstance();
        //             if (ins) {
        //                 ins.emit(name, {
        //                     timestamp: new Date(),
        //                     type: type,
        //                     message: data
        //                 });
        //             }
        //         })
        //     )
        // }
        // //#endregion

        // 拦截错误信息
        ErrorHandler.setHandler((error, isFatal) => {
            onError(error);
        });


        return () => {
            // 移除错误信息的错误
            ErrorHandler.restore();
            // // 移除相关事件监听
            // listeners.forEach(listener => listener.remove());
        };
    }, []);

    const onCodeChange = React.useCallback(({hash}) => {
        if (hash) {
            setHash(hash);
        }
    }, []);

    const renderSocket = React.useCallback(() => {
        if (isDebug(option)) {
            const socketUrl = `${baseURI}/app?id=${id}`
            return (
                <SocketConnect url={socketUrl}
                               ref={socketRef}>
                    <SocketEvent name={CodeChangeEventName} callback={onCodeChange}/>
                </SocketConnect>
            );
        }
        return null;
    }, [option]);

    if (AppletContent) {
        return (
            <>
                <AppletContent {...initialProps}/>
                {renderSocket()}
            </>
        )
    }
    return null;
}

export default Applet;