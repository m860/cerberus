/**
 * 小程序的渲染类型
 */
export const RenderType = {
    web: "webView",
    native: "native"
};

/**
 * 小程序的应用类型
 * @property normal - 普通小程序
 * @property inner - 内部小程序
 */
export const AppletType = {
    normal: "normal",
    inner: "inner"
};

/**
 * 小程序状态
 */
export const AppletStatus = {
    //准备阶段,执行检查缓存等任务
    prepare: 1,
    //下载
    downloading: 2,
    //下载成功
    downloadSuccess: 3,
    //下载失败
    downloadFail: 4,
    //编译
    compiling: 5,
    //编译成功
    compileSuccess: 6,
    //编译失败
    compileFail: 7,
    //渲染
    rendering: 8,
    //渲染成功
    renderSuccess: 9,
    //渲染失败
    renderFail: 10,
    //发生错误
    error: 11
}