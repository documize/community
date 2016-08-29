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

export default Ember.Component.extend({
	editUser: null,
	deleteUser: null,
	drop: null,
	password: {},

	didReceiveAttrs() {
		this.users.forEach(user => {
			user.set('me', user.get('id') === this.get('session.session.authenticated.user.id'));
		});
	},

	willDestroyElement() {
		let drop = this.get('drop');

		if (is.not.null(drop)) {
			drop.destroy();
		}
	},

	actions: {
		toggleActive(id) {
			let user = this.users.findBy("id", id);
			user.set('active', !user.get('active'));
			this.attrs.onSave(user);
		},

		toggleEditor(id) {
			let user = this.users.findBy("id", id);
			user.set('editor', !user.get('editor'));
			this.attrs.onSave(user);
		},

		toggleAdmin(id) {
			let user = this.users.findBy("id", id);
			user.set('admin', !user.get('admin'));
			this.attrs.onSave(user);
		},

		edit(id) {
			let self = this;

			let user = this.users.findBy("id", id);
			let userCopy = user.getProperties('id', 'created', 'revised', 'firstname', 'lastname', 'email', 'initials', 'active', 'editor', 'admin', 'accounts');
			this.set('editUser', userCopy);
			this.set('password', {
				password: "",
				confirmation: ""
			});
			$(".edit-user-dialog").css("display", "block");
			$("input").removeClass("error");

			let drop = new Drop({
				target: $(".edit-button-" + id)[0],
				content: $(".edit-user-dialog")[0],
				classes: 'drop-theme-basic',
				position: "bottom right",
				openOn: "always",
				tetherOptions: {
					offset: "5px 0",
					targetOffset: "10px 0"
				},
				remove: false
			});

			self.set('drop', drop);

			drop.on('open', function () {
				self.$("#edit-firstname").focus();
			});
		},

		confirmDelete(id) {
			let user = this.users.findBy("id", id);
			this.set('deleteUser', user);
			$(".delete-user-dialog").css("display", "block");

			let drop = new Drop({
				target: $(".delete-button-" + id)[0],
				content: $(".delete-user-dialog")[0],
				classes: 'drop-theme-basic',
				position: "bottom right",
				openOn: "always",
				tetherOptions: {
					offset: "5px 0",
					targetOffset: "10px 0"
				},
				remove: false
			});

			this.set('drop', drop);
		},

		cancel() {
			let drop = this.get('drop');
			drop.close();
		},

		save() {
			let user = this.get('editUser');
			let password = this.get('password');
			debugger;

			if (is.empty(user.firstname)) {
				$("#edit-firstname").addClass("error").focus();
				return;
			}
			if (is.empty(user.lastname)) {
				$("#edit-lastname").addClass("error").focus();
				return;
			}
			if (is.empty(user.email)) {
				$("#edit-email").addClass("error").focus();
				return;
			}

			let drop = this.get('drop');
			drop.close();

			this.attrs.onSave(user);

			if (is.not.empty(password.password) && is.not.empty(password.confirmation) &&
				password.password === password.confirmation) {
				this.attrs.onPassword(user, password.password);
			}
		},

		delete() {
			let drop = this.get('drop');
			drop.close();

			let user = this.get('deleteUser');
			this.attrs.onDelete(user);
		}
	}
});
