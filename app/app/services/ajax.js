import AjaxService from 'ember-ajax/services/ajax';
import config from '../config/environment';

const {
	computed,
	inject: { service }
} = Ember;

export default AjaxService.extend({
	session: service(),
	host: config.apiHost,
	namespace: config.apiNamespace,

	headers: Ember.computed('session.session.content.authenticated.token', {
		get() {
			let headers = {};
			const token = this.get('session.session.content.authenticated.token');
			if (token) {
				headers['authorization'] = token;
			}

			return headers;
		}
	})
});
