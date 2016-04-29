import Ember from 'ember';

export default Ember.Component.extend({
    document: {},
    folder: {},

    actions: {
        // Page up - above pages shunt down.
        onPageSequenceChange(pendingChanges) {
            this.attrs.changePageSequence(pendingChanges);
        },

        // Move down -- pages below shift up.
        onPageLevelChange(pendingChanges) {
            this.attrs.changePageLevel(pendingChanges);
        },

        gotoPage(id) {
            return this.attrs.gotoPage(id);
        },
    }
});