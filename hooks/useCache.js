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

class ASCache<ICerberusCache> {
    get(hash: string) {
        return AsyncStorage.getItem(hash);
    }

    set(hash: string, code: string) {
        return AsyncStorage.setItem(hash, code);
    }
}

const defaultCache = new ASCache();

export default function (cache: ?ICerberusCache): CerberusCacheResult {

    const instance=cache?cache:defaultCache;

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
        cache:instance,
        preload
    }
}
