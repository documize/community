import Ember from 'ember';

export function documentTocEntry(params) {
	let currentPage = params[0];
    let nodeId = params[1];
	let nodeLevel = params[2];
    let html = "";
    let indent = (nodeLevel - 1) * 20;

    html += "<span style='margin-left: " + indent + "px;'></span>";

    if (currentPage === nodeId) {
        html += "<span class='selected'><i class='material-icons toc-bullet'>remove</i></span>";
        html += "";
    } else {
        html += "<span class=''><i class='material-icons toc-bullet'>remove</i></span>";
        html += "";
    }

    return new Ember.Handlebars.SafeString(html);
}

export default Ember.Helper.helper(documentTocEntry);
