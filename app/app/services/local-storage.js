import Ember from 'ember';

export default Ember.Service.extend({

	storeSessionItem: function (key, data) {
		localStorage[key] = data;
	},

	getSessionItem: function (key) {
		return localStorage[key];
	},

	clearSessionItem: function (key) {
		delete localStorage[key];
	}
});
