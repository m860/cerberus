import type {AppletOption} from "./Types";

export function getAppletBaseURL(option: AppletOption): string {
    if (option.debug) {
        return option.baseURI;
    }
    return `${option.baseURI}/${option.secretKey}/${option.hash}`
}

export function getAppletEntryUrl(option: AppletOption): string {
    const baseURL = getAppletBaseURL(option);
    return `${baseURL}/${option.name}`;
}