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

import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
	localStorage: service('localStorage'),
	i18n: service(),
	resultPhrase: '',
	searchQuery: computed('keywords', function() {
		return encodeURIComponent(this.get('keywords'));
	}),
	sortBy: {
		name: true,
		created: false,
		updated: false,
		asc: true,
		desc: false,
	},

	didReceiveAttrs() {
		this._super(...arguments);

		let docs = this.get('results');
		let duped = [];
		let phrase = this.i18n.localize('nothing_found');

		if (docs.length > 0) {
			duped = _.uniqBy(docs, function(item) {
				return item.get('documentId');
			});

			let references = docs.length === 1 ? this.i18n.localize('reference') : this.i18n.localize('references');
			let docLabel = duped.length === 1 ? this.i18n.localize('document') : this.i18n.localize('documents');
			let i = docs.length;
			let j = duped.length;
			phrase = `${i} ${references} in ${j} ${docLabel}`;
		}

		this.set('resultPhrase', phrase);

		let sortBy = this.get('localStorage').getSessionItem('search.sortBy');
		if (!_.isNull(sortBy) && !_.isUndefined(sortBy)) {
			this.send('onSetSort', sortBy);
		}

		let sortOrder = this.get('localStorage').getSessionItem('search.sortOrder');
		if (!_.isNull(sortOrder) && !_.isUndefined(sortOrder)) {
			this.send('onSetSort', sortOrder);
		}

		this.sortResults(duped);
	},

	sortResults(docs) {
		let ls = this.get('localStorage');
		let sortBy = this.get('sortBy');

		if (_.isNull(docs)) return;

		if (sortBy.name) {
			docs = docs.sortBy('document');
			ls.storeSessionItem('search.sortBy', 'name');
		}
		if (sortBy.created) {
			docs = docs.sortBy('created');
			ls.storeSessionItem('search.sortBy', 'created');
		}
		if (sortBy.updated) {
			docs = docs.sortBy('revised');
			ls.storeSessionItem('search.sortBy', 'updated');
		}
		if (sortBy.desc) {
			docs = docs.reverseObjects();
			ls.storeSessionItem('search.sortOrder', 'desc');
		} else {
			ls.storeSessionItem('search.sortOrder', 'asc');
		}

		this.set('documents', docs);
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
			this.sortResults(this.get('documents'));
		},
	}
});
