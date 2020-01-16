/**
 * @flow
 * @author Jean.h.ma 2020/1/15
 */
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
