import Ember from 'ember';

export default Ember.Component.extend({
	didReceiveAttrs() {
		this.set('rendererType', 'section/' + this.get('page.contentType') + '/type-renderer');
	},
});
