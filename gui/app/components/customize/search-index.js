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
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(Notifier, {
	appMeta: service(),
	i18n: service(),
	buttonLabel: '',

	init() {
		this._super(...arguments);
		this.buttonLabel = this.i18n.localize('search_reindex_rebuild');
	},

	actions: {
		reindex() {
			this.set('buttonLabel', this.i18n.localize('running'));
			this.notifyInfo(this.i18n.localize('search_reindex_start'));
			this.get('reindex')(() => {
				this.notifySuccess(this.i18n.localize('search_reindex_finish'));
				this.set('buttonLabel', this.i18n.localize('search_reindex_rebuild'));
			});
		}
	}
});
