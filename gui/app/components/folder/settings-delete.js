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
import { inject as service } from '@ember/service';
import AuthMixin from '../../mixins/auth';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(AuthMixin, Notifier, {
	router: service(),
	spaceSvc: service('folder'),
	localStorage: service('localStorage'),
	deleteSpaceName: '',

	actions: {
		onDelete(e) {
			e.preventDefault();

			let spaceName = this.get('space').get('name');
			let spaceNameTyped = this.get('deleteSpaceName');

			if (spaceNameTyped !== spaceName || spaceNameTyped === '' || spaceName === '') {
				$("#delete-space-name").addClass("is-invalid").focus();
				return;
			}

			$("#delete-space-name").removeClass("is-invalid");

			this.get('spaceSvc').delete(this.get('space.id')).then(() => { /* jshint ignore:line */
			});

			this.get('localStorage').clearSessionItem('folder');
			this.get('router').transitionTo('folders');
		}
	}
});
