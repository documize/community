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
	buttonLabel: 'Rebuild',

	actions: {
		reindex() {
			this.set('buttonLabel', 'Running...');
			this.notifyInfo("Starting search re-index process");
			this.get('reindex')(() => {
				this.notifySuccess("Search re-indexing complete");
			});
		}
	}
});
