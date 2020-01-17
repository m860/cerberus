/**
 * @flow
 * @author Jean.h.ma 2020/1/17
 */
import type {CerberusEntry} from "../hooks/useCerberus";

export function downloadCode(entry: CerberusEntry): Promise<string> {
    let url, option;
    if (typeof entry === "string") {
        url = entry;
    } else if (typeof entry === "object" && entry) {
        url = entry.url;
        option = entry.option;
    }
    return fetch(url, option)
        .then(res => res.text());
}
