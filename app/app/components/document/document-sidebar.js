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
import models from '../../utils/model';
import TooltipMixin from '../../mixins/tooltip';

export default Ember.Component.extend(TooltipMixin, {
    sectionService: Ember.inject.service('section'),
    documentService: Ember.inject.service('document'),

    document: {},
    folder: {},
    sections: [],
    showToc: true,
    showSectionList: false,

    // didRender() {
    //     if (this.get('isEditor')) {
    //         this.addTooltip(document.getElementById("add-section-button"));
    //     }
    // },

    // willDestroyElement() {
    //     this.destroyTooltips();
    // },

    actions: {
        // Page up - above pages shunt down.
        onPageSequenceChange(pendingChanges) {
            this.attrs.changePageSequence(pendingChanges);
        },

        // Move down - pages below shift up.
        onPageLevelChange(pendingChanges) {
            this.attrs.changePageLevel(pendingChanges);
        },

        gotoPage(id) {
            return this.attrs.gotoPage(id);
        },

        addSection() {
            let self = this;

            this.get('sectionService').getAll().then(function(sections) {
                self.set('sections', sections);
                self.set('showToc', false);
                self.set('showSectionList', true);
            });
        },

        showToc() {
            this.set('showSectionList', false);
            this.set('showToc', true);
        },

        onAddSection(section) {
            this.audit.record("added-section");
            this.audit.record("added-section-" + section.contentType);

            let page = models.PageModel.create({
                documentId: this.get('document.id'),
                title: `${section.title} Section`,
                level: 2,
                sequence: 2048,
                body: "",
                contentType: section.contentType
            });

            let meta = models.PageMetaModel.create({
                documentId: this.get('document.id'),
                rawBody: "",
                config: ""
            });

            let model = {
                page: page,
                meta: meta
            };

            this.attrs.onAddPage(model);
        }
    }
});