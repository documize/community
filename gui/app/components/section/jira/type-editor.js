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
import Component from '@ember/component';
import SectionMixin from '../../../mixins/section';
import TooltipMixin from '../../../mixins/tooltip';

export default Component.extend(SectionMixin, TooltipMixin, {
	sectionService: service('section'),
	isDirty: false,
	waiting: false,
	authenticated: false,
	issuesGrid: '',

	init() {
		this._super(...arguments);
		this.user = {};
		this.filters = [];
		this.config = {};
	},

	didReceiveAttrs() {
		this._super(...arguments);

		// Parse section config (usually the query that returns list of issues).
		let config = {};

		try {
			config = JSON.parse(this.get('meta.config'));
		} catch (e) {} // eslint-disable-line no-empty

		if (is.empty(config)) {
			config = {
				jql: '',
				itemCount: 0,
			};
		}

		this.set('config', config);
		this.set('waiting', true);

		this.get('sectionService').fetch(this.get('page'), "auth", this.get('config'))
			.then((response) => { // eslint-disable-line no-unused-vars
				this.set('authenticated', true);
				this.set('waiting', false);
			}, (reason) => { // eslint-disable-line no-unused-vars
				this.set('authenticated', false);
				this.set('waiting', false);
		});
	},

	actions: {
		isDirty() {
			return this.get('isDirty');
		},

		onPreview() {
			this.set('waiting', true);

			this.get('sectionService').fetchText(this.get('page'), 'preview', this.get('config'))
				.then((response) => { // eslint-disable-line no-unused-vars
					this.set('issuesGrid', response);
					this.set('authenticated', true);
					this.set('waiting', false);
				}, (reason) => { // eslint-disable-line no-unused-vars
					console.log(reason);
					this.set('issuesGrid', '');
					this.set('authenticated', false);
					this.set('waiting', false);
			});
		},

		onCancel() {
			let cb = this.get('onCancel');
			cb();
		},

		onAction(title) {
			let page = this.get('page');
			let meta = this.get('meta');
			page.set('title', title);
			meta.set('rawBody', JSON.stringify(this.get("items")));
			meta.set('config', JSON.stringify(this.get('config')));
			meta.set('externalSource', true);

			let cb = this.get('onAction');
			cb(page, meta);
		}
	}
});
