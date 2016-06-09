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
import models from '../utils/model';

export default Ember.Service.extend({
    sessionService: Ember.inject.service('session'),
    ajax: Ember.inject.service(),

    // Returns attributes for specified org id.
    getOrg(id) {
        let url = this.get('sessionService').appMeta.getUrl(`organizations/${id}`);

        return this.get('ajax').request(url).then((response) =>{
            let org = models.OrganizationModel.create(response);
            return org;
        });
    },

    // Updates an existing organization record.
    save(org) {
        let id = org.get('id');
        let url = this.get('sessionService').appMeta.getUrl(`organizations/${id}`);

        // refresh on-screen data
        this.get('sessionService').get('appMeta').setSafe('message', org.message);
        this.get('sessionService').get('appMeta').setSafe('title', org.title);

        return this.get('ajax').request(url, {
            method: 'PUT',
            data: JSON.stringify(org)
        }).then((response) => {
            return response;
        });
    }
});
