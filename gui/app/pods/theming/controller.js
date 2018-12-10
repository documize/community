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

import Notifier from '../../mixins/notifier';
import Controller from '@ember/controller';

export default Controller.extend(Notifier, {

	actions: {
		onSuccess() {
			this.notifySuccess('Saved');
		},

		onInfo() {
			this.notifyInfo('Working');
		},

		onWarn() {
			this.notifyWarn('Failed to get');
		},

		onError() {
			this.notifyError('Unable to save changes');
		},

		onButtonClick(v) {
			console.log(v); // eslint-disable-line no-console
		},

		onToolbarClick(v) {
			console.log(v); // eslint-disable-line no-console
		}
	}
});
