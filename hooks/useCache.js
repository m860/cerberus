/**
 * @flow
 * @author Jean.h.ma 2020/6/1
 *
 * Cache for Async Storage
 *
 */
import * as React from "react"
import AsyncStorage from "@react-native-community/async-storage"
import useBundle from "./useBundle";
import useUtils from "./useUtils";
import asyncIteratorReject from "graphql/subscription/asyncIteratorReject";

const PREFIX = `@cbs_`;

class ASCache<ICerberusCache> {
    get(hash: string) {
        return AsyncStorage.getItem(`${PREFIX}${hash}`);
    }

    set(hash: string, code: string) {
        return AsyncStorage.setItem(`${PREFIX}${hash}`, code);
    }

    has(hash: string): Promise<boolean> {
        return AsyncStorage
            .getItem(`${PREFIX}${hash}`)
            .then(value => !!value)
            .catch(() => false);
    }

    remove(hash: string): Promise<boolean> {
        return AsyncStorage
            .removeItem(`${PREFIX}${hash}`)
            .then(() => true)
            .catch(() => false);
    }

    clear(): Promise<any> {
        return AsyncStorage
            .getAllKeys()
            .then(keys => {
                const cbsKeys = keys.filter(f => new RegExp(`^${PREFIX}`).test(f));
                return AsyncStorage.multiRemove(cbsKeys);
            })
    }
}

const defaultCache = new ASCache();

export default function (cache: ?ICerberusCache): CerberusCacheResult {

    const instance = cache ? cache : defaultCache;

    const {getBundle} = useBundle();

    const {download} = useUtils();

    const preload = React.useCallback(async (options: PreloadOptions) => {
        try {
            const bundle: Bundle = await getBundle(options.secret);
            const entry: ?Array<string> = bundle.entry;
            if (entry) {
                const url: ?string = options.queryEntry ? options.queryEntry(entry) : null;
                if (url) {
                    const code = await download(url);
                    await instance.set(url, code);
                }
            }
            return null;
        } catch (ex) {
            return ex;
        }
    }, []);

    return {
        cache: instance,
        preload
    }
}
