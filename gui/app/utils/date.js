// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

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
    return moment(new Date(date)).local().fromNow();
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
