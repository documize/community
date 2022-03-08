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

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { A } from '@ember/array';
import Component from '@ember/component';

export default Component.extend({
	localStorage: service(),
	i18n: service(),
	showDeleteDialog: false,
	showMoveDialog: false,
	selectedDocuments: A([]),
	selectedCaption: '',
	viewDensity: "1",

	showAdd: computed('permissions.documentAdd', 'documents', function() {
		return this.get('documents.length') === 0 && this.get('permissions.documentAdd');
	}),
	showLockout: computed('permissions.documentAdd', 'documents', function() {
		return this.get('documents.length') === 0 && !this.get('permissions.documentAdd');
	}),
	hasDocumentActions: computed('permissions.{documentDelete,documentMove}', function() {
		return this.get('permissions.documentDelete') || this.get('permissions.documentMove');
	}),
    showingAllDocs: computed('categoryFilter', 'numDocuments', 'documents', function() {
        return _.isEmpty(this.get('categoryFilter')) && this.get('documents').length == this.get("numDocuments");
    }),

	init() {
		this._super(...arguments);
		this.selectedCaption = this.i18n.localize('document');
	},

	didReceiveAttrs() {
		this._super(...arguments);

		let space = this.get('space');
		let targets = _.reject(this.get('spaces'), {id: space.get('id')});
		this.set('moveOptions', A(targets));
		this.set('selectedDocuments', A([]));

		let sortBy = this.get('localStorage').getSessionItem('space.sortBy');
		if (!_.isNull(sortBy) && !_.isUndefined(sortBy)) {
			this.send('onSetSort', sortBy);
		}

		let sortOrder = this.get('localStorage').getSessionItem('space.sortOrder');
		if (!_.isNull(sortOrder) && !_.isUndefined(sortOrder)) {
			this.send('onSetSort', sortOrder);
		}

		let viewDensity = this.get('localStorage').getSessionItem('space.density');
		if (!_.isNull(viewDensity) && !_.isUndefined(viewDensity)) {
			this.set('viewDensity', viewDensity);
		}
	},

	actions: {
		onSetSort(val) {
			switch (val) {
				case 'name':
					this.set('sortBy.name', true);
					this.set('sortBy.created', false);
					this.set('sortBy.updated', false);
					break;
				case 'created':
					this.set('sortBy.name', false);
					this.set('sortBy.created', true);
					this.set('sortBy.updated', false);
					break;
				case 'updated':
					this.set('sortBy.name', false);
					this.set('sortBy.created', false);
					this.set('sortBy.updated', true);
					break;
				case 'asc':
					this.set('sortBy.asc', true);
					this.set('sortBy.desc', false);
					break;
				case 'desc':
					this.set('sortBy.asc', false);
					this.set('sortBy.desc', true);
					break;
			}
		},

		// eslint-disable-next-line no-unused-vars
		onSortBy(attacher) {
			// attacher.hide();
			this.get('onFiltered')(this.get('documents'));
		},

		onSwitchView(v) {
			this.set('viewDensity', v);
			this.get('localStorage').storeSessionItem('space.density', v);
		},

		onShowDeleteDocuments() {
			this.set('showDeleteDialog', true);
		},

		onDeleteDocuments() {
			let list = this.get('selectedDocuments');
			this.set('selectedDocuments', A([]));
			this.set('showDeleteDialog', false);

			let cb = this.get('onDeleteDocument');
			cb(list);

			return true;
		},

		onShowMoveDocuments() {
			this.set('showMoveDialog', true);
		},

		onMoveDocuments() {
			let list = this.get('selectedDocuments');
			let spaces = this.get('spaces');
			let moveSpaceId = '';

			spaces.forEach(space => {
				if (space.get('selected')) {
					moveSpaceId = space.get('id');
				}
			});

			if (moveSpaceId === '') return false;

			this.set('showMoveDialog', false);
			this.set('selectedDocuments', A([]));

			let cb = this.get('onMoveDocument');
			cb(list, moveSpaceId);

			return true;
		},

		onExport() {
			let list = this.get('selectedDocuments');
			this.set('selectedDocuments', A([]));

			let cb = this.get('onExportDocument');
			cb(list);

			return true;
		},

        selectDocument(documentId) {
            let doc = this.get('documents').findBy('id', documentId);
            let list = this.get('selectedDocuments');

            doc.set('selected', !doc.get('selected'));

            if (doc.get('selected')) {
				list.pushObject(documentId);
            } else {
				list = _.without(list, documentId);
			}

			this.set('selectedCaption', list.length > 1 ? this.i18n.localize('document') : this.i18n.localize('documents'));
			this.set('selectedDocuments', A(list));
		},

		onPin(documentId) {
			this.get('onPin')(documentId);
		},

		onUnpin(documentId) {
			this.get('onUnpin')(documentId);
		},

        onPinSequence(documentId, direction) {
            this.get('onPinSequence')(documentId, direction);
        },
    }
});
