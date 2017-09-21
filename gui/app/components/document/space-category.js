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
import TooltipMixin from '../../mixins/tooltip';
import NotifierMixin from '../../mixins/notifier';

export default Ember.Component.extend(TooltipMixin, NotifierMixin, {
    documentService: Ember.inject.service('document'),
	sectionService: Ember.inject.service('section'),
	sessionService: Ember.inject.service('session'),
	appMeta: Ember.inject.service(),
	userService: Ember.inject.service('user'),
	localStorage: Ember.inject.service(),

	init() {
		this._super(...arguments);
	},

	didReceiveAttrs() {
		this._super(...arguments);
	},

    actions: {
    }
});
