import Ember from 'ember';

export default Ember.Component.extend({
    documentService: Ember.inject.service('document'),

    revisions: [],
    diffReport: "",
    busy: false,
    currentRevisionId: "",

    didReceiveAttrs() {
        if (is.undefined(this.get('model'))) {
            return;
        }

        let self = this;

        this.get('documentService').getPageRevisions(this.get('model.documentId'), this.get('model.pageId')).then(function(response) {
            if (is.array(response)) {
                self.set('revisions', response);
                if (response.length > 0) {
                    self.send('produceReport', response[0].id);
                }
            }
        });
    },

    didRender() {
        let self = this;
        Ember.run.schedule('afterRender', function(){
            Mousetrap.bind('esc', function() { self.send('cancelAction'); return false;});
        });
    },

    actions: {
        produceReport(revisionId) {
            this.set('busy', true);
            this.set('diffReport', "");
            this.set('currentRevisionId', revisionId);

            // visually mark active revision
            let revisions = this.get('revisions');

            revisions.forEach(function(revision) {
                Ember.set(revision, 'selected', false);
            });

            let revision = _.findWhere(revisions, { id: revisionId});
            Ember.set(revision, 'selected', true);

            let self = this;

            this.get('documentService').getPageRevisionDiff(this.get('model.documentId'),
                this.get('model.pageId'), revisionId).then(function(response) {
                    self.set('busy', false);
                    self.set('diffReport', Ember.String.htmlSafe(response));
            });
        },

        cancelAction() {
            this.attrs.editorClose();
        },

        primaryAction() {
            if (this.session.isEditor) {
                this.attrs.editorAction(this.get('model.pageId'), this.get('currentRevisionId'));
            }
        }
    }
});
