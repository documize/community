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

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
	i18n: service(),

    activate() {
		this.get('browser').setTitle(this.i18n.localize('product_news'));
	}
});
