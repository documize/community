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
import Controller from '@ember/controller';
import Encoding from "../../utils/encoding";

export default Controller.extend({
	ajax: service(),

	actions: {
		save() {
			return this.get('ajax').request("/setup", {
				method: 'POST',
				data: this.model,
				dataType: "text",
			}).then(() => {
				let dom = ""; // supports http://localhost:5001 installs (which is the default for all self-installs)
				let credentials = Encoding.Base64.encode(dom + ":" + this.model.email + ":" + this.model.password);
				window.location.href = "/auth/sso/" + encodeURIComponent(credentials) + '?fr=1';
			}).catch((/*error*/) => {
				// TODO notify user of the error within the GUI
			});
		}
	}
});
