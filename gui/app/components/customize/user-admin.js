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

import $ from 'jquery';
import AuthProvider from '../../mixins/auth';
import ModalMixin from '../../mixins/modal';
import Component from '@ember/component';

export default Component.extend(AuthProvider, ModalMixin, {
	bulkUsers: '',
	newUser: null,

	init() {
		this._super(...arguments);
		this.set('newUser', { firstname: '', lastname: '', email: '', active: true });
	},
	
	actions: {
		onOpenUserModal() {
			this.modalOpen("#add-user-modal", {"show": true}, '#newUserFirstname');
		},

		onAddUser() {
			if (is.empty(this.get('newUser.firstname'))) {
				$("#newUserFirstname").addClass('is-invalid').focus();
				return;
			}
			$("#newUserFirstname").removeClass('is-invalid');

			if (is.empty(this.get('newUser.lastname'))) {
				$("#newUserLastname").addClass('is-invalid').focus();
				return;
			}
			$("#newUserLastname").removeClass('is-invalid');

			if (is.empty(this.get('newUser.email')) || is.not.email(this.get('newUser.email'))) {
				$("#newUserEmail").addClass('is-invalid').focus();
				return;
			}
			$("#newUserEmail").removeClass('is-invalid');

			let user = this.get('newUser');

			this.get('onAddUser')(user).then(() => {
				this.set('newUser', { firstname: '', lastname: '', email: '', active: true });
			});

			this.modalClose("#add-user-modal");
		},

		onAddUsers() {
			if (is.empty(this.get('bulkUsers'))) {
				$("#bulkUsers").addClass('is-invalid').focus();
				return;
			}
			$("#bulkUsers").removeClass('is-invalid');

			this.get('onAddUsers')(this.get('bulkUsers')).then(() => {
				this.set('bulkUsers', '');
			});

			this.modalClose("#add-user-modal");
		}
	}
});
