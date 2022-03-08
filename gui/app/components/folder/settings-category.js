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
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import ModalMixin from '../../mixins/modal';
import Notifer from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(ModalMixin, Notifer, {
	spaceSvc: service('folder'),
	groupSvc: service('group'),
	categorySvc: service('category'),
	appMeta: service(),
	store: service(),
	i18n: service(),
	editId: '',
	editName: '',
	editDefault: false,
	deleteId: '',
	newCategory: '',

	init() {
		this._super(...arguments);
		this.users = [];
	},

	didReceiveAttrs() {
		this._super(...arguments);
		this.load();
	},

	willDestroyElement() {
		this._super(...arguments);
	},

	load() {
		// get categories
		this.get('categorySvc').getAll(this.get('space.id')).then((c) => {
			this.set('category', c);
			// get summary of documents and users for each category in space
			this.get('categorySvc').getSummary(this.get('space.id')).then((s) => {
				c.forEach((cat) => {
					let docs = _.filter(s, {categoryId: cat.get('id'), type: 'documents'});
					let docCount = 0;
					docs.forEach((d) => { docCount = docCount + d.count });

					let users = _.filter(s, {categoryId: cat.get('id'), type: 'users'});
					let userCount = 0;
					users.forEach((u) => { userCount = userCount + u.count });

					cat.set('documents', docCount);
					cat.set('users', userCount);
				});

				this.get('categorySvc').getUserVisible(this.get('space.id')).then((cm) => {
					cm.forEach((cm) => {
						let cat = _.find(c, {id: cm.get('id') });
						if (!_.isUndefined(cat)) {
							cat.set('access', !_.isUndefined(cat));
						}
					});
				});
			});
		});
	},

	permissionRecord(who, whoId, name) {
		let raw = {
			id: whoId,
			orgId: this.get('space.orgId'),
			categoryId: this.get('currentCategory.id'),
			whoId: whoId,
			who: who,
			name: name,
			categoryView: false,
		};

		let rec = this.get('store').normalize('category-permission', raw);
		return this.get('store').push(rec);
	},

	setEdit(id, val) {
		let cats = this.get('category');
		let cat = cats.findBy('id', id);

		if (!_.isUndefined(cat)) {
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
				spaceId: this.get('space.id')
			};

			this.get('categorySvc').add(c).then(() => {
				this.load();
				this.notifySuccess(this.i18n.localize('added'));
			});
		},

		onShowEdit(id) {
			let cat = this.get('category').findBy('id', id);
			this.set('editId', cat.get('id'));
			this.set('editName', cat.get('category'));
			this.set('editDefault', cat.get('isDefault'));

			this.modalOpen('#category-edit-modal', {show: true}, "#edit-category-id");
		},

		onShowDelete(id) {
			let cat = this.get('category').findBy('id', id);
			this.set('deleteId', cat.get('id'));

			this.modalOpen('#category-delete-modal', {show: true});
		},

		onDelete() {
			this.modalClose('#category-delete-modal');

			this.get('categorySvc').delete(this.get('deleteId')).then(() => {
				this.load();
			});
		},

		onSave() {
			let name = this.get('editName');
			if (name === '') {
				$('#edit-category-name').addClass('is-invalid').focus();
				return false;
			}

			let cat = this.get('category').findBy('id', this.get('editId'));
			cat.set('category', name);
			cat.set('isDefault', this.get('editDefault'));

			this.modalClose('#category-edit-modal');
			$('#edit-category-name').removeClass('is-invalid');

			this.get('categorySvc').save(cat).then(() => {
				this.load();
			});
		},

		onShowAccessPicker(catId) {
			this.set('showCategoryAccess', true);

			let categoryPermissions = A([]);
			let category = this.get('category').findBy('id', catId);

			this.set('currentCategory', category);
			this.set('categoryPermissions', categoryPermissions);

			// get space permissions
			this.get('spaceSvc').getPermissions(this.get('space.id')).then((spacePermissions) => {
				spacePermissions.forEach((sp) => {
					let cp  = this.permissionRecord(sp.get('who'), sp.get('whoId'), sp.get('name'));
					cp.set('selected', false);
					categoryPermissions.pushObject(cp);
				});

				this.get('categorySvc').getPermissions(category.get('id')).then((perms) => {
					// mark those users as selected that have permission to see the current category
					perms.forEach((perm) => {
						let c = categoryPermissions.findBy('whoId', perm.get('whoId'));
						if (!_.isUndefined(c)) {
							c.set('selected', true);
						}
					});

					this.set('categoryPermissions', categoryPermissions.sortBy('who', 'name'));
				});
			});
		},

		onToggle(item) {
			item.set('selected', !item.get('selected'));
		},

		onGrantAccess() {
			this.set('showCategoryAccess', false);

			let space = this.get('space');
			let category = this.get('currentCategory');
			let perms = this.get('categoryPermissions').filterBy('selected', true);

			this.get('categorySvc').setViewers(space.get('id'), category.get('id'), perms).then(() => {
				this.load();
			});
		}
	}
});
