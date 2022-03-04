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
import Notifier from '../../../mixins/notifier';
import Controller from '@ember/controller';

export default Controller.extend(Notifier, {
	labelSvc: service('label'),
	i18n: service(),

	load() {
		this.get('labelSvc').getAll().then((labels) => {
			this.set('model', labels);
		});
	},

	actions: {
		onAdd(label) {
			this.get('labelSvc').add(label).then(() => {
				this.load();
				this.notifySuccess(this.i18n.localize('added'));
			});
		},

		onDelete(id) {
			this.get('labelSvc').delete(id).then(() => {
				this.load();
				this.notifySuccess(this.i18n.localize('deleted'));
			});
		},

		onUpdate(label) {
			this.get('labelSvc').update(label).then(() => {
				this.load();
				this.notifySuccess(this.i18n.localize('saved'));
			});
		}
	}
});
