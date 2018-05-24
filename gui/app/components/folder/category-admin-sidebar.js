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
import Component from '@ember/component';

export default Component.extend({
	newCategory: '',

	actions: {
		didInsertElement() {
			this._super(...arguments);
			$('#new-category-name').focus();
		},

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
				folderId: this.get('space.id')
			};

			this.get('onAdd')(c);
		}
	}
});
