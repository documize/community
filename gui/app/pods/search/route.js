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

import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
	i18n: service(),
	matchFilter: null,

	beforeModel(transition) {
		let matchFilter = {
			matchDoc: _.isUndefined(transition.to.queryParams.matchDoc) ? true : (transition.to.queryParams.matchDoc == 'true'),
			matchContent: _.isUndefined(transition.to.queryParams.matchContent) ? true : (transition.to.queryParams.matchContent == 'true'),
			matchTag: _.isUndefined(transition.to.queryParams.matchTag) ? true : (transition.to.queryParams.matchTag == 'true'),
			matchFile: _.isUndefined(transition.to.queryParams.matchFile) ? true : (transition.to.queryParams.matchFile == 'true'),
			slog: _.isUndefined(transition.to.queryParams.slog) ? false : (transition.to.queryParams.slog === 'true'),
		};

		this.set('matchFilter', matchFilter);
	},

	setupController: function (controller, model) {
		this._super(controller, model);

		controller.set('model', model);
		controller.set('matchFilter', this.get('matchFilter'));
	},

    activate() {
		this.get('browser').setTitle(this.i18n.localize('search'));
	}
});
