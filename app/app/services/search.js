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

export default Ember.Service.extend({
    sessionService: Ember.inject.service('session'),
    ajax: Ember.inject.service(),

    // getUsers returns all users for organization.
    find(keywords) {
        let url = this.get('sessionService').appMeta.getUrl("search?keywords=" + encodeURIComponent(keywords));

        return this.get('ajax').request(url).then((response) => {
            return response;
        });
    },
});
