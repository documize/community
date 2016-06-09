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

    importStockTemplate: function(folderId, templateId) {

        let url = this.get('sessionService').appMeta.getUrl("templates/" + templateId + "/folder/" + folderId + "?type=stock");

        return this.get('ajax').post(url).then((response)=>{
            return response;
        });
    },

    importSavedTemplate: function(folderId, templateId) {
        let url = this.get('sessionService').appMeta.getUrl("templates/" + templateId + "/folder/" + folderId + "?type=saved");

        return this.get('ajax').post(url).then((doc)=>{
            let docModel = models.DocumentModel.create(doc);
            return docModel;
        });
    },

    getSavedTemplates() {
        let url = this.get('sessionService').appMeta.getUrl("templates");

        return this.get('ajax').request(url, {
            type: 'GET'
        }).then((response) => {
            if (is.not.array(response)) {
                response = [];
            }
            let templates = Ember.ArrayProxy.create({
                content: Ember.A([])
            });

            _.each(response, function(template) {
                let templateModel = models.TemplateModel.create(template);
                templates.pushObject(templateModel);
            });

            return templates;
        });
    },

    getStockTemplates() {
        let url = this.get('sessionService').appMeta.getUrl("templates/stock");

        return this.get('ajax').request(url, {
            type: 'GET'
        }).then((response) => {
            return response;
        });
    }
});
