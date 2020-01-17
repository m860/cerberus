/**
 * @flow
 * @author Jean.h.ma 2020/1/15
 */
import {getBundle} from "./services";
import type {Bundle} from "./services";
import type {QueryEntry} from "../hooks/useCloudCerberus";
import {DefaultQueryEntry} from "../hooks/useCloudCerberus";
import {downloadCode} from "./utils";

export interface ICerberusCache {
    get(hash: string): Promise<string | null>;

    set(hash: string, code: string): Promise<boolean>;
};

export class CerberusMemoryCache implements ICerberusCache {
    _caches = {};

    set(hash: string, code: string): Promise<boolean> {
        this._caches[hash] = code;
        return Promise.resolve(true);
    }

    get(hash: string): Promise<string | null> {
        return Promise.resolve(this._caches[hash]);
    }
}

export const memoryCache = new CerberusMemoryCache();

export type PreloadOption = {
    secret: string,
    cache?: ICerberusCache,
    queryEntry?: QueryEntry
};

/**
 * 预加载cloud widget
 */
export async function preloadCloud(option: PreloadOption): Promise<?Error> {
    const {
        secret,
        cache = memoryCache,
        queryEntry = DefaultQueryEntry
    } = option;
    try {
        const bundle: Bundle = await getBundle(secret);
        const hash: ?string = bundle.hash;
        const entry: ?Array<string> = bundle.entry;
        if (hash && entry) {
            const url: ?string = queryEntry(entry);
            if (url) {
                const code = await downloadCode(url);
                await cache.set(hash, code);
            }
        }
        return null;
    } catch (ex) {
        return ex;
    }
}
