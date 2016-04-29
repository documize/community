import Ember from 'ember';

export default Ember.Mixin.create({
	tooltips: [],

	addTooltip(elem) {
		let t = new Tooltip({target: elem});
		let tt = this.get('tooltips');
		tt.push(t);
	},

	destroyTooltips() {
		let tt = this.get('tooltips');

		tt.forEach(t => {
			t.destroy();
		});

		tt.length = 0;

		this.set('tooltips', tt);
	}
});
