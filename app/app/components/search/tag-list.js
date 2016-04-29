import Ember from 'ember';

export default Ember.Component.extend({
    documentTags: [],
    tagz: [],

    didInitAttrs() {
        let tagz = [];

        if (this.get('documentTags').length > 1) {
            let tags = this.get('documentTags').split('#');
            _.each(tags, function(tag) {
                if (tag.length > 0) {
                    tagz.pushObject(tag);
                }
            });
        }

        this.set('tagz', tagz);
    }
});
