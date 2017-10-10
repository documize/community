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

export default Ember.Mixin.create({
	closeDropdown() {
		let drop = this.get('dropdown');

		if (is.not.null(drop) && is.not.null(drop.drop)) {
			drop.close();
		}
	},

	destroyDropdown() {
		let drop = this.get('dropdown');

		if (is.not.null(drop) && is.not.null(drop.drop)) {
			drop.destroy();
		}
	},

	dropDefaults: {
		// position: "bottom right",
		openOn: "always",
		tetherOptions: {
			offset: "5px 0",
			targetOffset: "10px 0",
			// targetModifier: 'visible',
			// attachment: 'middle right',
			// targetAttachment: 'middle right',
			constraints: [
				{
					to: 'scrollParent',
					attachment: 'together'
				}
			],
			// optimizations: {
			// 	moveElement: false,
			// 	gpu: false
			// },
		},
	}
});
