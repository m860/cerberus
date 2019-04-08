import * as React from "react"
import {AppletStatus} from "./Enums";
import type {AppletOption} from "./Types";
import PropTypes from "prop-types"
import {exportAllModules, getDebugAppletEntryUrl, getAppletPackageUrl, getEntryFile} from "./Utils";
import ErrorHandler from "./ErrorHandler"
import {ConsoleEvent, SocketEvents} from "./Events";
import {SocketConnect, SocketEvent} from "react-socket-io-client"
import RNFetchBlob from "rn-fetch-blob";
import Emitter from "./Emitter"
import {unzip} from 'react-native-zip-archive'

type Props = AppletOption & {
    navigation: Object,
    renderPrepareScreen: (props: { progress: number }) => React.Element,
    renderErrorScreen: (error: Error) => React.Element,
    id?: string,
    rootDir?: string,
    /**
     * 导出小程序额外的modules,只需要导出小程序中自定义的modules,React和ReactNative已经自动导出
     */
    exportModules: (option: AppletOption) => Object
}

type State = {
    //小程序的下载进度
    downloadProgress: number,
    //小程序当前的状态
    status: $Values<typeof AppletStatus>,
    //错误信息
    error: ?Error
};

/**
 * 小程序容器
 */
export default class Applet extends React.Component<Props, State> {

    static defaultProps = {
        debug: false,
        id: Date.now().toString(),
        rootDir: RNFetchBlob.fs.dirs.CacheDir + "/applets"
    };

    static getDerivedStateFromError(error) {
        return {
            error: error
        }
    }

    static childContextTypes = {
        parentNavigation: PropTypes.object
    };

    getChildContext() {
        return {
            parentNavigation: this.props.navigation
        }
    }


    get _socket() {
        if (this._socketConnectRef) {
            return this._socketConnectRef.getSocketInstance();
        }
        return null;
    }

    // get _exportModules(): Function {
    //     return memoizeOne((option: AppletOption) => {
    //         return {
    //             Console: new Console(option),
    //             ...this.props.exportModules(option),
    //         };
    //     }, equal);
    // }

    get _appletOption(): AppletOption & { exportModules: Function } {
        const {navigation, id, renderErrorScreen, renderPrepareScreen, ...rest} = this.props;
        return rest;
    }

    _socketConnectRef = null;
    _listeners = [];


    constructor(props) {
        super(props);
        this._createApplet = null;
        this._component = null;
        this._downloadRequest = null;
        this.state = {
            downloadProgress: 0,
            status: AppletStatus.prepare,
            error: null
        };
        ErrorHandler.setHandler((error, isFatal) => {
            this.setState({
                error: error,
                status: AppletStatus.error
            });
        });
    }

    _renderSocket() {
        if (this.props.debug) {
            return (
                <SocketConnect url={`${this.props.baseURI}/app?id=${this.props.id}`}
                               ref={ref => this._socketConnectRef = ref}>
                    <SocketEvent name={SocketEvents.changed} callback={this._appletChanged}/>
                </SocketConnect>
            );
        }
        return null;
    }

    render() {
        if (this.state.status === AppletStatus.prepare) {
            return this.props.renderPrepareScreen({
                progress: this.state.downloadProgress
            });
        }
        else if (this.state.error) {
            return this.props.renderErrorScreen(this.state.error);
        }
        else if (this._component) {
            return (
                <React.Fragment>
                    <this._component></this._component>
                    {this._renderSocket()}
                </React.Fragment>
            )
        }
        return null;
    }

    async componentDidMount() {
        await this._loadApplet();
        this.setState({
            status: AppletStatus.renderSuccess
        });
        if (this.props.debug) {
            this._listeners.push(
                Emitter.addListener(ConsoleEvent, ({name, data, type}) => {
                    if (this._socket) {
                        this._socket.emit(name, {
                            timestamp: new Date(),
                            type: type,
                            message: data
                        });
                    }
                })
            )
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        //如果render success则不进行render操作,只是状态变化
        if (nextState.status === AppletStatus.renderSuccess
            || nextState.status === AppletStatus.downloadSuccess
            || nextState.status === AppletStatus.compiling
            || nextState.status === AppletStatus.rendering) {
            console.warn(`以下状态不执行rerender:下载成功,编译中,渲染中,渲染成功`);
            return false;
        }
        else if (nextState.status === AppletStatus.downloading
            && this.state.downloadProgress === nextState.downloadProgress) {
            console.warn(`如果是正在下载且下载进度没有变化不执行rerender`);
            return false;
        }
        return true;
    }

    componentDidUpdate(nextProps, nextState) {
        if (this.state.status === AppletStatus.prepare) {
            this._loadApplet().then(() => {
                this.setState({
                    status: AppletStatus.renderSuccess
                });
            });
        }
    }

    componentWillUnmount() {
        ErrorHandler.restore();
        if (this._downloadRequest) {
            //如果下载还没有完成就取消下载
            this._downloadRequest.cancel();
        }
        this._listeners.forEach(listener => listener.remove());
    }

    /**
     * 小程序发生变化,App端重新下载小程序
     * @private
     */
    _appletChanged = async ({hash}) => {
        console.log(`applet changed ${hash}`);
        const content = await this._downloadDebugApplet();
        if (content) {
            return this._compile(content);
        }
    };

    _setStateAsync(newState): Promise {
        return new Promise((resolve) => {
            this.setState(newState, resolve);
        });
    }

    // _refresh() {
    //     this._component = null;
    //     this._createApplet = null;
    //     this.setState({
    //         status: AppletStatus.prepare,
    //         error: null,
    //         downloadProgress: 0
    //     });
    // }

    async _loadApplet() {
        if (this.props.debug) {
            const content = await this._downloadDebugApplet();
            if (content) {
                await this._compile(content);
                await this._setStateAsync({
                    status: AppletStatus.rendering
                });
            }
        }
        else {
            const hasCache = await this._hasCache();
            if (hasCache) {
                await this._loadAppletFromCache();
            }
            else {
                const content = await this._downloadDebugApplet();
                if (content) {
                    await this._compile(content);
                    await this._setStateAsync({
                        status: AppletStatus.rendering
                    });
                }
            }
        }
    }

    async _loadAppletFromCache(): Promise {
        const filename = getEntryFile(this.props);
        try {
            const content = await RNFetchBlob.fs.readFile(filename, "utf8");
            return this._compile(content);
        }
        catch (ex) {
            await this._setStateAsync({
                status: AppletStatus.downloadFail,
                error: ex
            });
            const content = await this._downloadAppletPackage();
            if (content) {
                await this._compile(content);
                await this._setStateAsync({
                    status: AppletStatus.rendering
                });
            }
        }
    }

    async _compile(content): Promise<void> {
        if (!content) {
            await this._setStateAsync({
                status: AppletStatus.compileFail,
                error: new Error(`content is null`)
            });
            return;
        }
        console.log(`开始编译小程序...`);
        await this._setStateAsync({
            status: AppletStatus.compiling
        });
        try {
            eval(content);
            //TODO 这个检查可以放在CLI中进行实现
            if (this._createApplet && typeof this._createApplet === "function") {
                this._component = this._createApplet(...exportAllModules(this._appletOption));
                this.setState({
                    status: AppletStatus.compileSuccess
                });
            }
            else {
                console.log(`小程序的入口必须是一个Function对象`);
                await this._setStateAsync({
                    status: AppletStatus.compileFail,
                    error: new Error("小程序的入口必须是一个函数")
                });
            }
        }
        catch (ex) {
            console.log(`小程序编译失败:${ex.message}`);
            await this._setStateAsync({
                status: AppletStatus.compileFail,
                error: ex
            });
        }
    }

    _hasCache(): Promise<boolean> {
        const enterFile = getEntryFile(this.props);
        return RNFetchBlob.fs.exists(enterFile)
            .then((exist) => exist)
            .catch(() => false);
    }

    async _downloadDebugApplet(): Promise<string> {
        const url = getDebugAppletEntryUrl(this.props);
        console.log(`开始下载小程序:${url}`);
        await this._setStateAsync({
            status: AppletStatus.downloading
        });
        const request = RNFetchBlob.config({
            path: getEntryFile(this.props)
        }).fetch("GET", url);
        this._downloadRequest = request;
        return request.progress((received, total) => {
            const downloadProgress = Math.floor((received / total) * 100);
            this.setState({
                downloadProgress: downloadProgress
            });
        })
            .then(async res => {
                const status = res.respInfo.status;
                if (status === 200) {
                    console.log(`小程序下载成功:${res.path()}`);
                    this._downloadRequest = null;
                    return res.readFile("utf8").then(text => {
                        return this._setStateAsync({
                            status: AppletStatus.downloadSuccess,
                            error: null
                        }).then(() => text);
                    }).catch(err => {
                        return this._setStateAsync({
                            status: AppletStatus.downloadFail,
                            error: err
                        });
                    });
                }
                else {
                    await this._setStateAsync({
                        status: AppletStatus.downloadFail,
                        error: new Error(`下载失败,status=${status}`)
                    });
                    return null;
                }
            })
            .catch(async err => {
                this._downloadRequest = null;
                console.log(`小程序下载出错:${getDebugAppletEntryUrl(this.props)},${err.message}`);
                await this._setStateAsync({
                    status: AppletStatus.downloadFail,
                    error: err
                });
                return null;
            })
    }

    async _downloadAppletPackage(): Promise<string> {
        const url = getAppletPackageUrl(this.props);
        const packageName = `${this.props.rootDir}/${this.props.secretKey}/${this.props.hash}.zip`;
        const unzipPath = `${this.props.rootDir}/${this.props.secretKey}`;
        await this._setStateAsync({
            status: AppletStatus.downloading
        });
        const request = RNFetchBlob.config({
            path: packageName
        }).fetch("GET", url);
        this._downloadRequest = request;
        return request.progress((received, total) => {
            const downloadProgress = Math.floor((received / total) * 100);
            this.setState({
                downloadProgress: downloadProgress
            });
        })
            .then(async res => {
                const status = res.respInfo.status;
                if (status === 200) {
                    console.log(`小程序下载成功:${res.path()}`);
                    this._downloadRequest = null;
                    return unzip(packageName, unzipPath).then((path) => {
                        const enterPath = getEntryFile(this.props);
                        return RNFetchBlob.fs.readFile(enterPath).then(text => {
                            return this._setStateAsync({
                                status: AppletStatus.downloadSuccess,
                                error: null
                            }).then(() => text);
                        });
                    }).catch((err) => {
                        return this._setStateAsync({
                            status: AppletStatus.downloadFail,
                            error: err
                        });
                    })
                }
                else {
                    await this._setStateAsync({
                        status: AppletStatus.downloadFail,
                        error: new Error(`下载失败,status=${status}`)
                    });
                    return null;
                }
            })
            .catch(async err => {
                this._downloadRequest = null;
                console.log(`小程序下载出错:${url},${err.message}`);
                await this._setStateAsync({
                    status: AppletStatus.downloadFail,
                    error: err
                });
                return null;
            })
    }
}