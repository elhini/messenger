export function getParamValue(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

export function isRemoteHost() {
    var host = window.location.hostname;
    return ['shortmsg.vercel.app', 'messenger.elhini.vercel.app'].includes(host);
}

export function getApiURL() {
    return isRemoteHost() ? 'https://shortmsg.herokuapp.com' : 'http://localhost:8000';
}