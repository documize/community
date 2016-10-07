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

export default Ember.Component.extend(NotifierMixin, {
	localStorage: Ember.inject.service(),
	canEditTemplate: "",

	actions: {
		editTemplate(template) {
			this.audit.record('edited-saved-template');
			this.attrs.onEditTemplate(template);

			return true;
		},

		startDocument(template) {
			this.audit.record('used-saved-template');
			this.attrs.onDocumentTemplate(template.id, template.title, "private");

			return true;
		}
	}
});

/*
setTemplate(chosen) {
	if (is.undefined(chosen)) {
		return;
	}

	this.set('selectedTemplate', chosen);
	this.set('canEditTemplate', chosen.id !== "0" ? "Edit" : "");

	let templates = this.get('savedTemplates');

	templates.forEach(template => {
		Ember.set(template, 'selected', template.id === chosen.id);
	});
},


*/
