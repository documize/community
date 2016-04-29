import Ember from 'ember';
import TooltipMixin from '../../mixins/tooltip';

export default Ember.Component.extend(TooltipMixin, {
    didRender() {
        if (this.get('isEditor')) {
            let self = this;
            $(".page-edit-button, .page-delete-button").each(function(i, el) {
                self.addTooltip(el);
            });
        }
    },

    actions: {
        editPage(id) {
            this.attrs.onEditPage(id);
        },

        deletePage(id) {
            this.attrs.onDeletePage(id);
        },
    }
});