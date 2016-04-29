import Ember from 'ember';

export default Ember.Service.extend({
    sessionService: Ember.inject.service('session'),

    init() {
        this.setMetaDescription();
    },

    setTitle(title) {
        document.title = title + " | " + this.get('sessionService').appMeta.title;
    },

    setTitleReverse(title) {
        document.title = this.get('sessionService').appMeta.title + " | " + title;
    },

    setTitleAsPhrase(title) {
        document.title = this.get('sessionService').appMeta.title + " " + title;
    },

    setTitleWithoutSuffix(title) {
        document.title = title;
    },

    setMetaDescription(description) {
        $('meta[name=description]').remove();

        if (is.null(description) || is.undefined(description)) {
            description = this.get('sessionService').appMeta.message;
        }

        $('head').append( '<meta name="description" content="' + description + '">' );
    }
});
