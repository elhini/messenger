export function findFromLast(arr, cb) {
    for (var i = arr.length - 1; i >= 0; i--){
        if (cb(arr[i])) return arr[i];
    }
}