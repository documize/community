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

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import NotifierMixin from '../../mixins/notifier';
import TooltipMixin from '../../mixins/tooltip';
import DropdownMixin from '../../mixins/dropdown';

export default Component.extend(NotifierMixin, TooltipMixin, DropdownMixin, {
	userService: service('user'),
	categoryService: service('category'),
	appMeta: service(),
	store: service(),
	newCategory: '',
	deleteId: '',
	dropdown: null,
	users: [],

	didReceiveAttrs() {
		this._super(...arguments);
		this.renderTooltips();
		this.load();
	},


	willDestroyElement() {
		this._super(...arguments);
		this.removeTooltips();
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
			this.get('userService').getSpaceUsers(this.get('folder.id')).then((users) => {
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
		onAdd(e) {
			e.preventDefault();

			let cat = this.get('newCategory');

			if (cat === '') {
				$('#new-category-name').addClass('is-invalid').focus();
				return;
			}

			$('#new-category-name').removeClass('is-invalid').focus();
			this.set('newCategory', '');

			let c = {
				category: cat,
				folderId: this.get('folder.id')
			};

			this.get('categoryService').add(c).then(() => {
				this.load();
			});
		},

		onShowDelete(id) {
			let cat = this.get('category').findBy('id', id);
			this.set('deleteId', cat.get('id'));

			$('#category-delete-modal').modal('dispose');
			$('#category-delete-modal').modal({show: true});
		},

		onDelete() {
			$('#category-delete-modal').modal('hide');
			$('#category-delete-modal').modal('dispose');

			this.get('categoryService').delete(this.get('deleteId')).then(() => {
				this.load();
			});
		},

		onEdit(id) {
			this.setEdit(id, true);
			this.removeTooltips();
		},

		onEditCancel(id) {
			this.setEdit(id, false);
			this.load();
			this.renderTooltips();
		},

		onSave(id) {
			let cat = this.setEdit(id, true);
			if (cat.get('category') === '') {
				$('#edit-category-' + cat.get('id')).addClass('is-invalid').focus();
				return false;
			}

			cat = this.setEdit(id, false);
			$('#edit-category-' + cat.get('id')).removeClass('is-invalid');

			this.get('categoryService').save(cat).then(() => {
				this.load();
			});

			this.renderTooltips();
		},

		onShowAccessPicker(catId) {
			this.set('showCategoryAccess', true);

			let users = this.get('users');
			let category = this.get('category').findBy('id', catId);

			this.get('categoryService').getPermissions(category.get('id')).then((viewers) => {
				// mark those users as selected that have already been given permission
				// to see the current category;
				users.forEach((user) => {
					let userId = user.get('id');
					let selected = viewers.isAny('whoId', userId);
					user.set('selected', selected);
				});

				this.set('categoryUsers', users);
				this.set('currentCategory', category);
			});
		},

		onGrantAccess() {
			this.set('showCategoryAccess', false);

			let folder = this.get('folder');
			let category = this.get('currentCategory');
			let users = this.get('categoryUsers').filterBy('selected', true);
			let viewers = [];

			users.forEach((user) => {
				let userId = user.get('id');

				let v = {
					orgId: this.get('folder.orgId'),
					folderId: this.get('folder.id'),
					categoryId: category.get('id'),
					userId: userId
				};

				viewers.push(v);
			});

			this.get('categoryService').setViewers(folder.get('id'), category.get('id'), viewers).then(() => {
				this.load();
			});
		}
	}
});
