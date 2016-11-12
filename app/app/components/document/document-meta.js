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

	didReceiveAttrs() {
		// setup document owner
		let owner = this.get('users').findBy('id', this.get('document.userId'));

		// no document owner? You are the owner!
		if (is.undefined(owner)) {
			owner = this.session.user;
		}

		this.set('owner', owner);
	},

	actions: {
		onSave() {
			let doc = this.get('document');

			if (is.empty(doc.get('excerpt'))) {
				$("meta-excerpt").addClass("error").focus();
				return false;
			}

			doc.set('excerpt', doc.get('excerpt').substring(0, 250));
			doc.set('userId', this.get('owner.id'));

			this.attrs.onSave(doc);
			return true;
		},
	}
});
