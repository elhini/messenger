export function req(method, path, data, successCallback, errorCallback = () => {}, finallyCallback) {
    var body = data ? JSON.stringify(data) : null;
    return fetch('http://localhost:8000/api/' + path, {
        method: method, 
        headers: {'Content-Type': 'application/json'}, 
        credentials: 'include',
        body: body
    })
    .then(res => {
        if (res.ok) {
            return res.json();
        }
        else {
            var errorText = 'url ' + res.url + ' responded: ' + 
                res.status + ' (' + res.statusText + ')';
            throw new Error(errorText);
        }
    })
    .then(res => {
        console.log(method, path, ':', res);
        if (res.error) {
            throw new Error(res.error);
        }
        successCallback(res);
    })
    .catch(err => {
        console.error('fetch failed with', err);
        errorCallback(err.toString());
    })
    .finally(finallyCallback);
}