import Ember from 'ember';

export default Ember.Component.extend({
    didReceiveAttrs() {
        this.set('editorType', 'section/' + this.get('page.contentType') + '/type-editor');
    },

    actions: {
        onCancel() {
            this.attrs.onCancel();
        },

        onAction(page, meta) {
            this.attrs.onAction(page, meta);
        }
    }
});