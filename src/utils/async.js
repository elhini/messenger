export function req(method, path, data, callback) {
    var body = data ? JSON.stringify(data) : null;
    return fetch('http://localhost:8000/api/' + path, {
        method: method, 
        headers: {'Content-Type': 'application/json'}, 
        body: body
    })
    .then(res => res.json())
    .then(res => {
        console.log(method, path, ':', res);
        callback(res);
    })
    .catch(err => console.error('err', err));
}