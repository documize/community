import Ember from 'ember';
import config from '../config/environment';

const {
	String: { htmlSafe },
	RSVP: { resolve },
	inject: { service }
} = Ember;

export default Ember.Service.extend({
	ajax: service(),

	url: `${config.apiHost}/${config.apiNamespace}`,
	orgId: '',
	title: '',
	version: '',
	message: '',
	allowAnonymousAccess: null,

	boot() {
		let dbhash;
		if (is.not.null(document.head.querySelector("[property=dbhash]"))) {
			dbhash = document.head.querySelector("[property=dbhash]").content;
		}

		let isInSetupMode = dbhash && dbhash !== "{{.DBhash}}";
		if (isInSetupMode) {
			this.setProperites({
				title: htmlSafe("Documize Setup"),
				allowAnonymousAccess: false
			});
			return resolve();
		}

		return this.get('ajax').request('public/meta')
		.then((response) => {
				this.setProperties(response);
	        });
	}
});
