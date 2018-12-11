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

// import $ from 'jquery';
import stringUtil from '../../utils/string';
import Component from '@ember/component';

export default Component.extend({
	contentId: '',
	title: '',
	size: '',

	didInsertElement() {
		this._super(...arguments);
		this.set("contentId", 'confirm-modal-' + stringUtil.makeId(10));
	},

	actions: {
	}
});
