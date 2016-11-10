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

export default Ember.Component.extend(NotifierMixin, TooltipMixin, {
	sectionService: Ember.inject.service('section'),
	viewMode: true,
	editMode: false,

	didReceiveAttrs(){
		if (this.get('mode') === 'edit') {
			this.send('onEdit');
		}
	},

	didInsertElement() {
		let self = this;
		this.get('sectionService').refresh(this.get('model.document.id')).then(function (changes) {
			changes.forEach(function (newPage) {
				let oldPage = self.get('model.page');
				if (!_.isUndefined(oldPage) && oldPage.get('id') === newPage.get('id')) {
					oldPage.set('body', newPage.get('body'));
					oldPage.set('revised', newPage.get('revised'));
					self.showNotification(`Refreshed ${oldPage.get('title')}`);
				}
			});
		});
	},

	actions: {
		onEdit() {
			this.set('viewMode', false);
			this.set('editMode', true);
		},

		onView() {
			this.set('viewMode', true);
			this.set('editMode', false);
		},

		onCancel() {
			this.send('onView');
		},

		onAction(page, meta) {
			this.get('onAction')(page, meta);
			this.send('onView');
		},

		onDelete() {
			this.get('onDelete')(this.get('model.document'), this.get('model.page'));
			return true;
		}
	}
});
