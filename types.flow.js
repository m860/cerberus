import type {CerberusEntry} from "./hooks/useCerberus";

/**
 * @flow
 * @author Jean.h.ma 2020/6/1
 */

declare type QueryEntry = (entries: Array<string>)=>string | null;

declare interface ICerberusCache {
    get(hash: string): Promise<string | null>;

    set(hash: string, code: string): Promise<any>;
}

declare type PreloadOptions = {
    secret: string,
    queryEntry?: QueryEntry
}

declare type CerberusCacheResult = {
    cache: ICerberusCache,
    preload: (options: PreloadOptions)=>any
};

declare type Bundle = {
    hash: ?string,
    entry: ?Array<string>
};

declare type UtilsResult = {
    download: (entry: CerberusEntry) => Promise<string>
};
