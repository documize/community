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

export default Ember.Component.extend({
    folderService: Ember.inject.service('folder'),
    selectedDocuments: [],
	moveTarget: null,
	emptyState: Ember.computed('documents', function() {
        return this.get('documents.length') === 0;
    }),

    didReceiveAttrs() {
		this.audit.record('viewed-space');
        this.set('selectedDocuments', []);
        this.set('canCreate', this.get('folderService').get('canEditCurrentFolder'));
        this.set('deleteTargets', this.get('folders').rejectBy('id', this.get('folder.id')));
    },

	didInsertElement() {
		this._super(...arguments);
		
		this.setupAddWizard();
	},

    setupAddWizard() {
		Ember.run.schedule('afterRender', () => {
			$('.start-document:not(.start-document-empty-state)').off('.hoverIntent');

			$('.start-document:not(.start-document-empty-state)').hoverIntent({interval: 100, over: function() {
				// in
				$(this).find('.start-button').velocity("transition.slideDownIn", {duration: 300});
			}, out: function() {
				// out
				$(this).find('.start-button').velocity("transition.slideUpOut", {duration: 300});
			} });
		});		
	},

    actions: {
        selectDocument(documentId) {
            let doc = this.get('documents').findBy('id', documentId);
            let list = this.get('selectedDocuments');

            doc.set('selected', !doc.get('selected'));

            if (doc.get('selected')) {
                list.push(documentId);
            } else {
                var index = list.indexOf(documentId);
                if (index > -1) {
                    list.splice(index, 1);
                }
            }

            this.set('selectedDocuments', list);
            this.get('onDocumentsChecked')(list);
        },

		onDelete() {
			this.get("onDeleteSpace")();
		},

        onImport() {
            this.get('onImport')();
        },

		onShowDocumentWizard(docId) {
			if ($("#new-document-wizard").is(':visible') && this.get('docId') === docId) {
				this.send('onHideDocumentWizard');
				return;
			}

			this.set('docId', docId);

			$("#new-document-wizard").insertAfter(`#document-${docId}`);
			$("#new-document-wizard").velocity("transition.slideDownIn", { duration: 300, complete:
				function() {
					$("#new-document-name").focus();
				}});
		},

		onHideDocumentWizard() {
			$("#new-document-wizard").insertAfter('#wizard-placeholder');
			$("#new-document-wizard").velocity("transition.slideUpOut", { duration: 300 });
		}
    }
});
