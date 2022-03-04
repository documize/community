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
import Notifier from '../../mixins/notifier';
import stringUtil from '../../utils/string';
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend(AuthProvider, ModalMixin, Notifier, {
	bulkUsers: '',
	newUser: null,
	i18n: service(),

	init() {
		this._super(...arguments);
		this.set('newUser', { firstname: '', lastname: '', email: '', editor: true, viewUsers: true, active: true });
	},

	actions: {
		onOpenUserModal() {
			this.modalOpen("#add-user-modal", {"show": true}, '#newUserFirstname');
		},

		onAddUser() {
			if (_.isEmpty(this.get('newUser.firstname'))) {
				$("#newUserFirstname").addClass('is-invalid').focus();
				return;
			}
			$("#newUserFirstname").removeClass('is-invalid');

			if (_.isEmpty(this.get('newUser.lastname'))) {
				$("#newUserLastname").addClass('is-invalid').focus();
				return;
			}
			$("#newUserLastname").removeClass('is-invalid');

			if (_.isEmpty(this.get('newUser.email')) || !stringUtil.isEmail(this.get('newUser.email'))) {
				$("#newUserEmail").addClass('is-invalid').focus();
				return;
			}
			$("#newUserEmail").removeClass('is-invalid');

			let user = this.get('newUser');

			this.get('onAddUser')(user).then(() => {
				this.set('newUser', { firstname: '', lastname: '', email: '', active: true });
				this.notifySuccess(this.i18n.localize('added'));
			});

			this.modalClose("#add-user-modal");
		},

		onAddUsers() {
			if (_.isEmpty(this.get('bulkUsers'))) {
				$("#bulkUsers").addClass('is-invalid').focus();
				return;
			}
			$("#bulkUsers").removeClass('is-invalid');

			this.get('onAddUsers')(this.get('bulkUsers')).then(() => {
				this.set('bulkUsers', '');
				this.notifySuccess(this.i18n.localize('added'));
			});

			this.modalClose("#add-user-modal");
		}
	}
});
