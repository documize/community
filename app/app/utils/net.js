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

function getSubdomain() {
	if (is.ipv4(window.location.host)) {
		return "";
	}

	let domain = "";
	let parts = window.location.host.split(".");

	if (parts.length > 1) {
		domain = parts[0].toLowerCase();
	}

	return domain;
}

function getAppUrl(domain) {
	let parts = window.location.host.split(".");
	parts.removeAt(0);

	let leftOvers = parts.join(".");

	if (is.empty(domain)) {
		domain = "";
	} else {
		domain = domain + ".";
	}

	return window.location.protocol + "//" + domain + leftOvers;
}

function isAjaxAccessError(reason) {
	if (typeof reason === "undefined" || typeof reason.errors === "undefined") {
		return false;
	}

	if (reason.errors.length > 0 && (reason.errors[0].status === "401" || reason.errors[0].status === "403")) {
		return true;
	}

	return false;
}

function isAjaxNotFoundError(reason) {
	if (typeof reason === "undefined" || typeof reason.errors === "undefined") {
		return false;
	}

	if (reason.errors.length > 0 && (reason.errors[0].status === "404")) {
		return true;
	}

	return false;
}

function isInvalidLicenseError(reason) {
	if (typeof reason === "undefined" || typeof reason.errors === "undefined") {
		return false;
	}

	if (reason.errors.length > 0 && reason.errors[0].status === "402") {
		return true;
	}

	return false;
}

export default {
	getSubdomain,
	getAppUrl,
	isAjaxAccessError,
	isAjaxNotFoundError,
	isInvalidLicenseError,
};
