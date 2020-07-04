export function req(method, path, data, callback, appendAlert = () => {}) {
    var body = data ? JSON.stringify(data) : null;
    return fetch('http://localhost:8000/api/' + path, {
        method: method, 
        headers: {'Content-Type': 'application/json'}, 
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
            appendAlert({ text: res.error, style: 'error'});
        }
        callback(res);
    })
    .catch(err => {
        console.error('fetch failed with', err);
        appendAlert({ text: err.toString(), style: 'error' });
    });
}