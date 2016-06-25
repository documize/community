import AjaxService from 'ember-ajax/services/ajax';
import config from '../config/environment';

export default AjaxService.extend({
	host: config.host,
	namespace: config.namespace
});
