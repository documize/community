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

import { inject as service } from '@ember/service';
import { set } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
	appMeta: service(),
	value: '',
	onChange: null,

	didReceiveAttrs() {
		this._super(...arguments);

		let defTheme = this.get('appMeta.theme');
		this.get('appMeta').getThemes().then((themes) => {
			_.each(themes, (theme) => {
				theme.selected = theme.name === defTheme ? true: false;
				if (theme.name === '') theme.name = 'Default';
			});

			this.set('themes', themes);
		});
	},

	actions: {
		onSelect(selectedTheme) {
			let themes = this.get('themes');
			if (this.get('onChange') !== null) {
				_.each(themes, (theme) => {
					set(theme, 'selected', theme.name === selectedTheme ? true: false);
				});
				this.get('onChange')(selectedTheme);
			}
		}
	}
});
