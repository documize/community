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

import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
	classNames: [],
	classNameBindings: ['calcClass'],

	size: 500,

	calcClass: computed(function() {
		let size = parseInt(this.size, 10);

		switch(size) {
			case 100:
				return 'spacer-100';

			case 200:
				return 'spacer-200';

			case 300:
				return 'spacer-300';

			case 400:
				return 'spacer-400';

			case 500:
				return 'spacer-500';

			case 600:
				return 'spacer-600';

			case 700:
				return 'spacer-700';
		}

		return 'spacer-100';
	}),
});
