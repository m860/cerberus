/**
 * @flow
 * @author Jean.h.ma 2020/6/1
 */

declare type QueryEntry = (entries: Array<string>)=>string | null;

declare interface ICerberusCache {
    get(hash: string): string | null;

    set(hash: string, code: string): any;

    has(hash: string): boolean;

    remove(hash: string): boolean;

    clear(): any
}

declare type BundleRecord = {
    secret: string,
    hash: string,
    bundles: Array<string>
};

declare interface IBundleCache {
    get(secret: string): BundleRecord | null;

    set(record: BundleRecord): any;

    has(secret: string): boolean;

    clear(): any;
}

declare type PreloadOptions = {
    secret: string,
    // bundle缓存
    bundleCache: IBundleCache,
    // 如果参数缺省，则会加载bundle下的所有entry
    queryEntry?: ?QueryEntry,
    // 默认的bundle，如果存在会优先使用
    bundle?: ?Bundle,
}

declare type CerberusCacheResult = {
    cache: ICerberusCache,
    preload: (options: PreloadOptions)=>any
};

declare type Bundle = {
    hash: string,
    entry: Array<string>
};

declare type UtilsResult = {
    download: (entry: CerberusEntry) => Promise<string>
};

/**
 * option参数对应fetch option
 */
declare type CerberusEntry = ?string | ?{ url: string, option?: Object };

declare type CerberusOption = {
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

declare type CloudCerberusProps = $Diff<CerberusOption, {| entry: any, debug: any, hash: any |}> & {
    secret: string,
    /**
     * 查询需要使用的entry，默认情况返回第一个entry
     */
    queryEntry?: QueryEntry,
    bundleCache?: ?IBundleCache
}
