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
import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
	firstname: attr('string'),
	lastname: attr('string'),
	email: attr('string'),
	initials: attr('string'),
	active: attr('boolean', { defaultValue: false }),
	editor: attr('boolean', { defaultValue: false }),
	admin: attr('boolean', { defaultValue: false }),
	viewUsers: attr('boolean', { defaultValue: false }),
	analytics: attr('boolean', { defaultValue: false }),
	global: attr('boolean', { defaultValue: false }),
	accounts: attr(),
	groups: attr(),
	lastVersion: attr('string'),
	theme: attr('string'),
	created: attr(),
	revised: attr(),
	locale: attr('string', { defaultValue: "en-US" }),

	fullname: computed('firstname', 'lastname', function () {
		return `${this.get('firstname')} ${this.get('lastname')}`;
	}),

	generateInitials() {
		let first = this.get('firstname').trim();
		let last = this.get('lastname').trim();
		this.set('initials', first.substr(0, 1) + last.substr(0, 1));
	}
});
