/**
 * @flow
 * @author Jean.h.ma 2020/6/1
 */
import type {CerberusEntry} from "./useCerberus";

const download = (entry: CerberusEntry) => {
    let url, option;
    if (typeof entry === "string") {
        url = entry;
    } else if (entry && typeof entry === "object") {
        url = entry.url;
        option = entry.option;
    } else {
        return Promise.reject(`无法识别的entry：${JSON.stringify(entry)}`)
    }
    return fetch(url, option)
        .then(res => res.text());
}

export default function (): UtilsResult {
    return {
        download
    }
}

