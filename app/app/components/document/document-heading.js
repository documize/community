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
import NotifierMixin from '../../mixins/notifier';
import TooltipMixin from '../../mixins/tooltip';

const {
	computed,
} = Ember;

export default Ember.Component.extend(NotifierMixin, TooltipMixin, {
	documentService: Ember.inject.service('document'),
	editMode: false,
	docName: '',
	docExcerpt: '',

	hasNameError: computed.empty('docName'),
	hasExcerptError: computed.empty('docExcerpt'),

	actions: {
		toggleEdit() {
			this.set('docName', this.get('document.name'));
			this.set('docExcerpt', this.get('document.excerpt'));
			this.set('editMode', true);
		},

		onSaveDocument() {
			if (this.get('hasNameError') || this.get('hasExcerptError')) {
				return;
			}

			this.set('document.name', this.get('docName'));
			this.set('document.excerpt', this.get('docExcerpt'));
			this.showNotification('Saved');
			this.get('documentService').save(this.get('document'));

			this.set('editMode', false);
		},

		cancel() {
			this.set('editMode', false);
		}
	}
});
