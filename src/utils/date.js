export function toStr(date) {
    var dateStr = date instanceof Date ? date.toISOString() : date || '';
    return dateStr.replace('T', ' ').substr(0, 19);
}

export function dateDiff(date1, date2) {
    if (!date1 || !date2) return 0;
    typeof date1 === 'string' && (date1 = new Date(date1));
    typeof date2 === 'string' && (date2 = new Date(date2));
    var unixMs1 = date1 && date1.getTime();
    var unixMs2 = date2.getTime();
    return unixMs2 - unixMs1;
}

export function roundDuration(durationMs) {
    if (durationMs > 1000 * 60 * 60 * 24) {
        return formatWithUnit(Math.round(durationMs / 1000 / 60 / 60 / 24), 'day');
    }
    if (durationMs > 1000 * 60 * 60) {
        return formatWithUnit(Math.round(durationMs / 1000 / 60 / 60), 'hr');
    }
    if (durationMs > 1000 * 60) {
        return formatWithUnit(Math.round(durationMs / 1000 / 60), 'min');
    }
    if (durationMs > 1000) {
        return formatWithUnit(Math.round(durationMs / 1000), 'sec');
    }
}

export function formatWithUnit(number, unit) {
    return number + ' ' + unit + (number > 1 ? 's' : '');
}