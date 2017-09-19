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

const {
	inject: { service }
} = Ember;

export default Ember.Component.extend(NotifierMixin, {
	folderService: service('folder'),
	categoryService: service('category'),
	appMeta: service(),
	store: service(),
	newCategory: '',

	didReceiveAttrs() {
		this.load();
	},

	load() {
		this.get('categoryService').getAll(this.get('folder.id')).then((c) => {
			this.set('category', c);
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

		onCancel(id) {
			this.setEdit(id, false);
		},

		onSave(id) {
			let cat = this.setEdit(id, false);

			this.get('categoryService').save(cat).then(() => {
				this.load();
			});
		}
	}
});
