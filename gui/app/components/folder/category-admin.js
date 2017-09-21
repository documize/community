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
import DropdownMixin from '../../mixins/dropdown';

const {
	inject: { service }
} = Ember;

export default Ember.Component.extend(NotifierMixin, TooltipMixin, DropdownMixin, {
	userService: service('user'),
	categoryService: service('category'),
	appMeta: service(),
	store: service(),
	newCategory: '',
	dropdown: null,
	users: [],

	didReceiveAttrs() {
		this.load();
	},

	didRender() {
		// this.addTooltip(this.$(".action"));
	},

	willDestroyElement() {
		this.destroyDropdown();
	},

	load() {
		// get categories
		this.get('categoryService').getAll(this.get('folder.id')).then((c) => {
			this.set('category', c);

			// get summary of documents and users for each category in space
			this.get('categoryService').getSummary(this.get('folder.id')).then((s) => {
				c.forEach((cat) => {
					let docs = _.findWhere(s, {categoryId: cat.get('id'), type: 'documents'});
					let docCount = is.not.undefined(docs) ? docs.count : 0;

					let users = _.findWhere(s, {categoryId: cat.get('id'), type: 'users'});
					let userCount = is.not.undefined(users) ? users.count : 0;

					cat.set('documents', docCount);
					cat.set('users', userCount);
				});
			});

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
			this.closeDropdown();
			let users = this.get('users');
			let category = this.get('category').findBy('id', catId);

			this.get('categoryService').getPermissions(category.get('id')).then((viewers) => {
				// mark those users as selected that have already been given permission
				// to see the current category;
				users.forEach((user) => {
					let userId = user.get('id') === '0' ? '' : user.get('id');
					let selected = viewers.isAny('whoId', userId);
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

				this.set('dropdown', drop);
			});
		},

		onGrantCancel() {
			this.closeDropdown();
		},

		onGrantAccess() {
			let category = this.get('currentCategory');
			let users = this.get('categoryUsers').filterBy('selected', true);
			let viewers = [];

			users.forEach((user) => {
				let userId = user.get('id');
				if (userId === "0") userId = '';

				let v = {
					orgId: this.get('folder.orgId'),
					folderId: this.get('folder.id'),
					categoryId: category.get('id'),
					userId: userId
				};

				viewers.push(v);
			});

			this.get('categoryService').setViewers(category.get('id'), viewers).then(() => {
				this.load();
			});

			this.closeDropdown();
		}
	}
});
