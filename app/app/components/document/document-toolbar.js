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
	appMeta: Ember.inject.service(),
	userService: Ember.inject.service('user'),
	localStorage: Ember.inject.service(),
	drop: null,
	users: [],
	menuOpen: false,
	saveTemplate: {
		name: "",
		description: ""
	},

	didReceiveAttrs() {
		this.set('saveTemplate.name', this.get('document.name'));
		this.set('saveTemplate.description', this.get('document.excerpt'));
	},

	didRender() {
		if (this.session.isEditor) {
			this.addTooltip(document.getElementById("add-document-tab"));
		}
	},

	willDestroyElement() {
		this.destroyTooltips();
	},

	actions: {
		onMenuOpen() {
			this.set('menuOpen', !this.get('menuOpen'));
		},

		deleteDocument() {
			this.attrs.onDocumentDelete();
		},

		printDocument() {
			window.print();
		},

		saveTemplate() {
			var name = this.get('saveTemplate.name');
			var excerpt = this.get('saveTemplate.description');

			if (is.empty(name)) {
				$("#new-template-name").addClass("error").focus();
				return false;
			}

			if (is.empty(excerpt)) {
				$("#new-template-desc").addClass("error").focus();
				return false;
			}

			this.showNotification('Template saved');
			this.attrs.onSaveTemplate(name, excerpt);

			return true;
		}
	}
});