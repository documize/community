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
import { isPresent } from '@ember/utils';
import Controller from '@ember/controller';

export default Controller.extend({
	userService: service('user'),
	session: service(),

	actions: {
		save(passwords) {
			let password = passwords.password;
			let confirmation = passwords.confirmation;

			return this.get('userService').save(this.model).then(() => {
				if (isPresent(password) && isPresent(confirmation)) {
					this.get('userService').updatePassword(this.get('model.id'), password);
				}
				this.model.generateInitials();
				this.get('session').set('user', this.model);
				this.transitionToRoute('folders');
			});
		}
	}
});
