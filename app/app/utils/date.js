// "2014/02/05"
function toShortDate(date) {
    return moment(new Date(date)).format('YYYY/MM/DD');
}

// ISO date format
function toIsoDate(date, format) {
    return moment(date).format(format);
}

function formatDate(date, format) {
    return moment(toIsoDate(date, format));
}

function timeAgo(date) {
    return moment(new Date(date)).fromNow();
}

function timeAgoUTC(date) {
    return moment.utc((new Date(date))).local().fromNow();
}

export default {
    toShortDate,
    toIsoDate,
    formatDate,
    timeAgo,
    timeAgoUTC
};
