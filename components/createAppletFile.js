/**
 * @overview 文件描述
 * @author jean.h.ma
 */
import RNFetchBlob from "rn-fetch-blob"

export default function createAppletFile(option): AppletFile {
    const cachePath = option.rootDir;
    return {
        rm: (path: string) => {
            const fileName = cachePath + path;
            return RNFetchBlob.fs.unlink(fileName);
        },
        exists: (path: string) => {
            const fileName = cachePath + path;
            return RNFetchBlob.fs.exists(fileName);
        },
        mkdir: (path: string) => {
            const fileName = cachePath + path;
            return RNFetchBlob.fs.mkdir(fileName);
        },
        download: (option: AppletFileDownloadOption) => {
            return RNFetchBlob.config({
                path: cachePath + option.fileName
            }).fetch("GET", option.url, option.headers || {});
        },
        upload: (option: AppletFileUploadOption) => {
            return RNFetchBlob.fetch("POST", option.url, {
                'Content-Type': 'multipart/form-data',
                ...(option.headers || {})
            }, option.buildData(RNFetchBlob.wrap))
        },
        getAbsolutePath: (path: string) => {
            return cachePath + path;
        },
    };
}

export type AppletFileDownloadOption = {
    url: string,
    fileName: string,
    headers?: Object,
};

export type AppletFileUploadOption = {
    url: string,
    headers?: Object,
    buildData: (wrap: Function) => mixed
};

export type AppletFile = {
    rm: () => Promise,
    download: (option: AppletFileDownloadOption) => Promise<mixed>,
    upload: (option: AppletFileUploadOption) => Promise<mixed>,
    exists: (path: string) => Promise<Boolean>,
    mkdir: (path: string) => Promise,
    getAbsolutePath: (path: string) => string
};
