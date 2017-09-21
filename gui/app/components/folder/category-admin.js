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

const {
	inject: { service }
} = Ember;

export default Ember.Component.extend(NotifierMixin, TooltipMixin, {
	userService: service('user'),
	categoryService: service('category'),
	appMeta: service(),
	store: service(),
	newCategory: '',
	drop: null,
	users: [],

	didReceiveAttrs() {
		this.load();
	},

	didRender() {
		// this.addTooltip(this.$(".action"));
	},

	willDestroyElement() {
		let drop = this.get('drop');

		if (is.not.null(drop)) {
			drop.destroy();
		}
	},

	load() {
		// get categories
		this.get('categoryService').getAll(this.get('folder.id')).then((c) => {
			this.set('category', c);

			// get users that this space admin user can see
			this.get('userService').getAll().then((users) => {
				// set up Everyone user
				let u = {
					orgId: this.get('folder.orgId'),
					folderId: this.get('folder.id'),
					userId: '',
					firstname: 'Everyone',
					lastname: '',
				};

				let data = this.get('store').normalize('user', u)
				users.pushObject(this.get('store').push(data));

				users = users.sortBy('firstname', 'lastname');
				this.set('users', users);
			});
		});
	},

	setEdit(id, val) {
		let cats = this.get('category');
		let cat = cats.findBy('id', id);

		if (is.not.undefined(cat)) {
			cat.set('editMode', val);
		}

		return cat;
	},

	actions: {
		onAdd() {
			let cat = this.get('newCategory');

			if (cat === '') {
				$('#new-category-name').addClass('error').focus();
				return;
			}

			$('#new-category-name').removeClass('error').focus();
			this.set('newCategory', '');

			let c = {
				category: cat,
				folderId: this.get('folder.id')
			};

			this.get('categoryService').add(c).then(() => {
				this.load();
			});
		},

		onDelete(id) {
			this.get('categoryService').delete(id).then(() => {
				this.load();
			});
		},

		onEdit(id) {
			this.setEdit(id, true);
		},

		onEditCancel(id) {
			this.setEdit(id, false);
			this.load();
		},

		onSave(id) {
			let cat = this.setEdit(id, true);
			if (cat.get('category') === '') {
				$('#edit-category-' + cat.get('id')).addClass('error').focus();
				return;
			}

			cat = this.setEdit(id, false);
			$('#edit-category-' + cat.get('id')).removeClass('error');

			this.get('categoryService').save(cat).then(() => {
				this.load();
			});
		},

		onShowAccessPicker(catId) {
			let users = this.get('users');
			let category = this.get('category').findBy('id', catId);

			this.get('categoryService').getViewers(category.get('id')).then((viewers) => {
				// mark those users as selected that have already been given permission
				// to see the current category;
				console.log(viewers);

				users.forEach((user) => {
					let selected = viewers.isAny('id', user.get('id'));
					user.set('selected', selected);
				});

				this.set('categoryUsers', users);
				this.set('currentCategory', category);

				$(".category-access-dialog").css("display", "block");

				let drop = new Drop({
					target: $("#category-access-button-" + catId)[0],
					content: $(".category-access-dialog")[0],
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
			});
		},

		onGrantCancel() {
			let drop = this.get('drop');
			drop.close();
		},

		onGrantAccess() {
			let category = this.get('currentCategory');
			let users = this.get('categoryUsers').filterBy('selected', true);
			let viewers = [];

			users.forEach((user) => {
				let v = {
					orgId: this.get('folder.orgId'),
					folderId: this.get('folder.id'),
					categoryId: category.get('id'),
					userId: user.get('id')
				};

				viewers.push(v);
			});

			this.get('categoryService').setViewers(category.get('id'), viewers).then( () => {});

			let drop = this.get('drop');
			drop.close();
		}
	}
});
