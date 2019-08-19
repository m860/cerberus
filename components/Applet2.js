/**
 * @flow
 * @author Jean.h.ma 2019-08-19
 */
import * as React from "react"
import type {AppletOption} from "./Types";
import RNFetchBlob from "rn-fetch-blob";
import {AppletStatus} from "./Enums";
import {exportAllModules, getAppletEntryFile, getAppletPackageUrl, getDebugAppletEntryUrl} from "./Utils";
import StatefulPromise from "rn-fetch-blob/class/StatefulPromise";
import {SocketConnect, SocketEvent} from "react-socket-io-client";
import {ConsoleEvent, SocketEvents} from "./Events";
import Emitter from "./Emitter";
import ErrorHandler from "./ErrorHandler";
import {unzip} from "react-native-zip-archive";

type Props = AppletOption & {
    // parent navigation
    navigation: any,
    // // render加载页面
    // renderPrepareScreen: (props: { progress: number }) => React.Element<*>,
    // // render加载页面，仅在下载的时候才显示
    // renderLoadingScreen?: ({ progress: number })=>any,
    // // render错误页面
    // renderErrorScreen: (error: Error) => React.Element<*>,
    // 用于socket连接
    id?: string,
    // 小程序存储位置
    rootDir?: string,
    /**
     * 导出小程序额外的modules,只需要导出小程序中自定义的modules,React和ReactNative已经自动导出
     */
    exportModules: (option: AppletOption) => Object,
    // 小程序的初始化props
    initialProps?: ?Object,
    // 小程序状态变化
    onStatusChange?: ()=>any
}

export const DefaultAppletRootDir = RNFetchBlob.fs.dirs.CacheDir + "/applets";

function downloadDebugApplet(
    props: AppletOption,
    rootDir: string = DefaultAppletRootDir,
    downloadProgress?: (received: number, total: number)=>any,
    downloadSuccess?: (code: string)=>any,
    downloadError?: (error: any)=>any
): StatefulPromise<*> {
    const url = getDebugAppletEntryUrl(props);
    const request: StatefulPromise<*> = RNFetchBlob.config({
        path: getAppletEntryFile({...props, rootDir})
    }).fetch("GET", url);

    if (downloadProgress) {
        request.progress(downloadProgress);
    }

    request.then((res) => {
        const status = res.respInfo.status;
        if (status === 200) {
            res.readFile("utf8").then(text => {
                downloadSuccess && downloadSuccess(text);
            }).catch(err => {
                downloadError && downloadError(err);
            });
        } else {
            downloadError && downloadError(new Error(`小程序下载失败：url=${url},status=${status}`));
        }
    })
        .catch((err) => {
            downloadError && downloadError(err);
        });

    return request;
}

export function downloadApplet(
    option: AppletOption,
    rootDir: string = DefaultAppletRootDir,
    downloadProgress?: (received: number, total: number)=>any,
    downloadSuccess?: (code: string)=>any,
    downloadError?: (error: any)=>any
): StatefulPromise<*> {
    const url = getAppletPackageUrl(option);
    const packageFilePath = `${rootDir}/${option.secretKey}/${option.hash}.zip`;
    const unzipPackageFilePath = `${rootDir}/${option.secretKey}/${option.hash}`;

    const request: StatefulPromise<*> = RNFetchBlob.config({
        path: packageFilePath
    }).fetch("GET", url);

    if (downloadProgress) {
        request.progress(downloadProgress);
    }

    request.then((res) => {
        const status = res.respInfo.status;
        if (status === 200) {
            return unzip(packageFilePath, unzipPackageFilePath).then((path) => {
                //删除zip文件
                RNFetchBlob.fs.unlink(packageFilePath).catch(() => null);
                const enterPath = getAppletEntryFile({...option, rootDir});
                return RNFetchBlob.fs.readFile(enterPath, "utf8").then(text => {
                    if (typeof text === "string") {
                        downloadSuccess && downloadSuccess(text);
                    } else {
                        downloadError && downloadError(new Error(`文件内容必须是字符串`));
                    }
                }).catch(err => downloadError && downloadError(err));
            }).catch((err) => {
                downloadError && downloadError(err);
            });
        } else {
            downloadError && downloadError(new Error(`小程序下载失败：url=${url},status=${status}`));
        }
    }).catch(err => downloadError && downloadError(err));

    return request;
}

function createAppletExecutable(code: string, scope = {}): { exec: (self: any)=>any } {
    const scopeKeys = Object.keys(scope);
    // $FlowFixMe
    const appletExecutable = new Function(...scopeKeys, code);
    return {
        exec(self: any) {
            appletExecutable.apply(self, scopeKeys.map(key => scope[key]));
        }
    }
}

export function hasCache(option: AppletOption, rootDir: string = DefaultAppletRootDir): Promise<boolean> {
    const enterFile = getAppletEntryFile({...option, rootDir});
    return RNFetchBlob.fs.exists(enterFile)
        .then((exist) => exist)
        .catch(() => false);
}

function compile(
    code: string,
    option: AppletOption,
    exportModules: Function,
    rootDir: string = DefaultAppletRootDir,
    parentNavigation: any,
    compileError?: (err: any)=>any
) {
    if (!code) {
        compileError && compileError(new Error(`编译小程序失败：小程序不存在`))
        return null;
    }
    try {
        createAppletExecutable(code, {
            __AppletRequire: (moduleName: string) => {
                const allModules = exportAllModules({
                    ...option,
                    exportModules,
                    rootDir,
                    parentNavigation
                });
                switch (moduleName) {
                    case 'react': {
                        return allModules[0];
                    }
                    case 'react-native': {
                        return allModules[1];
                    }
                    case '@ibuild-community/applet': {
                        return allModules[2];
                    }
                }
            }
        }).exec(this);

        // $FlowFixMe
        const creator = this._createApplet;
        //TODO 这个检查可以放在CLI中进行实现
        if (creator && typeof creator === "function") {
            if (creator.metadata && creator.metadata.buildType === "normal") {
                return creator;
            } else {
                return creator(...exportAllModules({
                    ...option,
                    exportModules,
                    rootDir,
                    parentNavigation
                }));
            }
        } else {
            compileError && compileError(new Error("小程序的入口必须是一个函数"));
        }
    } catch (ex) {
        compileError && compileError(ex);
    }
}

function Applet(props: Props) {
    const {
        navigation,
        id = Date.now().toString(),
        rootDir = DefaultAppletRootDir,
        exportModules,
        initialProps = {},
        onStatusChange,

        // AppletOption
        baseURI,
        hash,
        debug = false,
        name,
        secretKey,
        permission,
        icon,
        description,
        isItAuthorized,
        renderType,
        appType
    } = props;

    const option: AppletOption = {
        baseURI,
        hash,
        debug,
        name,
        secretKey,
        permission,
        icon,
        description,
        isItAuthorized,
        renderType,
        appType
    };

    // 小程序状态
    const [status, setStatus] = React.useState([AppletStatus.prepare]);
    // 小程序内容组件
    const content = React.useRef(null);

    const socketRef = React.useRef<SocketConnect>();
    const getSocketInstance = () => {
        if (socketRef && socketRef.current) {
            return socketRef.current.getSocketInstance();
        }
        return null;
    };

    const loadAppletFromCache = () => {
        const filename = getAppletEntryFile({...option, rootDir});
        RNFetchBlob.fs.readFile(filename, "utf8")
            .then((code) => {
                if (typeof code === "string") {
                    const result = compile(code, option, exportModules, rootDir, navigation, (err) => {
                        setStatus([AppletStatus.compileFail, err]);
                    });
                    if (result) {
                        content.current = result;
                        setStatus([AppletStatus.rendering]);
                    } else {
                        setStatus([AppletStatus.compileFail, new Error("编译后的小程序为空")])
                    }
                } else {
                    setStatus([AppletStatus.error, new Error(`缓存文件异常`)])
                }
            })
            .catch(err => {
                setStatus([AppletStatus.error, new Error(`读取缓存文件失败：${filename}`)])
            });

    };

    // 监听status变化
    React.useEffect(() => {
        onStatusChange && onStatusChange(...status);
    }, [status]);

    React.useEffect(() => {
        //#region debug时，监听调试信息的console
        let listeners = [];
        if (debug) {
            listeners.push(
                Emitter.addListener(ConsoleEvent, ({name, data, type}) => {
                    const ins = getSocketInstance();
                    if (ins) {
                        ins.emit(name, {
                            timestamp: new Date(),
                            type: type,
                            message: data
                        });
                    }
                })
            )
        }
        //#endregion

        // 拦截错误信息
        ErrorHandler.setHandler((error, isFatal) => {
            setStatus([AppletStatus.error, error]);
        });

        //#region 加载小程序
        setStatus([AppletStatus.downloading, 0, 0]);
        let request = null;
        (async () => {
            const isCached = await hasCache(option, rootDir);
            if (!debug && isCached) {
                loadAppletFromCache();
            } else {
                const downloadHandler = debug ? downloadDebugApplet : downloadApplet;
                request = downloadHandler(
                    option,
                    rootDir,
                    (received, total) => setStatus([AppletStatus.downloading, received, total]),
                    (code) => {
                        setStatus([AppletStatus.downloadSuccess])
                        // 编译
                        const result = compile(code, option, exportModules, rootDir, navigation, (err) => {
                            setStatus([AppletStatus.compileFail, err]);
                        });
                        if (result) {
                            // setContent(result);
                            // Content = result;
                            content.current = result;
                            setStatus([AppletStatus.rendering]);
                        } else {
                            setStatus([AppletStatus.compileFail, new Error("编译后的小程序为空")])
                        }
                    },
                    (err) => setStatus([AppletStatus.error, err])
                );
            }
        })();

        //#endregion

        return () => {
            // 移除错误信息的错误
            ErrorHandler.restore();
            // 取消小程序下载
            request && request.cancel();
            // 移除相关事件监听
            listeners.forEach(listener => listener.remove());
        };
    }, []);

    const onCodeChange = async ({hash}) => {
        setStatus([AppletStatus.reload])
        downloadDebugApplet(option, rootDir, () => null, (code) => {
            const result = compile(code, option, exportModules, rootDir, navigation, (err) => setStatus([AppletStatus.error, err]));
            if (result) {
                content.current = result;
                setStatus([AppletStatus.rendering]);
            } else {
                setStatus([AppletStatus.compileFail, new Error("编译后的小程序为空")])
            }
        });
    };

    const renderSocket = () => {
        if (debug) {
            const socketUrl = `${baseURI}/app?id=${id}`
            return (
                <SocketConnect url={socketUrl}
                               ref={socketRef}>
                    <SocketEvent name={SocketEvents.changed} callback={onCodeChange}/>
                </SocketConnect>
            );
        }
        return null;
    }
    if (status[0] === AppletStatus.rendering) {
        // 渲染组件
        const Component = content.current;
        if (Component) {
            return (
                <React.Fragment>
                    <Component {...initialProps}/>
                    {renderSocket()}
                </React.Fragment>
            )
        }
    }
    return null;
}

export default Applet;