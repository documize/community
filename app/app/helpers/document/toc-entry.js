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

import Ember from 'ember';

export function documentTocEntry(params) {
    let currentPage = params[0];
    let nodeId = params[1];
    let nodeLevel = params[2];
    let html = "";
    let indent = (nodeLevel - 1) * 20;

    html += "<span style='margin-left: " + indent + "px;'></span>";

    if (currentPage === nodeId) {
        html += "<span class='selected'></span>";
        html += "";
    } else {
        html += "<span class=''></span>";
        html += "";
    }

    return new Ember.Handlebars.SafeString(html);
}

export default Ember.Helper.helper(documentTocEntry);