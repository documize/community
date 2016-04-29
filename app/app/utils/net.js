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

export default {
    getSubdomain,
    getAppUrl
};
