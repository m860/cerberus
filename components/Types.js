import {RenderType, AppletType} from "./Enums";
/**
 * 小程序的配置项
 */
export type AppletOption = {
    /** 小程序的基地址.例如:http://applet.yzw.cn */
    baseURI: string,
    /** 小程序当前版本的hash值 */
    hash: string,
    /** 是否是调试模式 */
    debug: boolean,
    /** 访问的页面名称.例如:main.js */
    name: string,
    /** 小程序的密钥 */
    secretKey: string,
    /** 小程序权限 */
    permission: number,
    /** icon的名字 */
    icon: string,
    /** 小程序的描述信息 */
    description: string,
    /** 是否已经授权 */
    isItAuthorized: boolean,
    /** 渲染类型 */
    renderType: $Values<typeof RenderType>,
    /** 应用类型 */
    appType: $Values<typeof AppletType>
};

/**
 *
 */
export type PrepareScreenProps = {
    progress: number
};

export type ImagePickerOption = {
    mediaType: $Values<typeof ImagePickerMediaType>,
    multiple: boolean
};

export type ImagePickerResult = {
    path: string;
    width: number;
    height: number;
    mime: string;
    size: number,
    modificationDate: string,
};

export type ToastOption = Object & {
    icon: {
        color: string,
        size: number
    }
}



