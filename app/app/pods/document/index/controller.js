import Ember from 'ember';
import NotifierMixin from '../../../mixins/notifier';

export default Ember.Controller.extend(NotifierMixin, {
    documentService: Ember.inject.service('document'),

    queryParams: ['page'],
    page: null,
    folder: {},
    pages: [],
    attachments: null,

    getAttachments() {
        let self = this;
        this.get('documentService').getAttachments(this.model.get('id')).then(function(attachments) {
            if (is.array(attachments)) {
                self.set('attachments', attachments);
            } else {
                self.set('attachments', []);
            }
        });
    },

    // Jump to the right part of the document.
    scrollToPage(pageId) {
        Ember.run.schedule('afterRender', function() {
            let dest;
            let target = "#page-title-" + pageId;
            let targetOffset = $(target).offset();

            if (is.undefined(targetOffset)) {
                return;
            }

            dest = targetOffset.top > $(document).height() - $(window).height() ? $(document).height() - $(window).height() : targetOffset.top;
            // small correction to ensure we also show page title
            dest = dest > 50 ? dest - 74 : dest;

            $("html,body").animate({
                scrollTop: dest
            }, 500, "linear");
            $(".toc-index-item").removeClass("selected");
            $("#index-" + pageId).addClass("selected");
        });
    },

    actions: {
        gotoPage(pageId) {
            if (is.null(pageId)) {
                return;
            }

            this.scrollToPage(pageId);
        },

        onPageSequenceChange(changes) {
            let self = this;

            this.get('documentService').changePageSequence(this.model.get('id'), changes).then(function() {
                _.each(changes, function(change) {
                    let pageContent = _.findWhere(self.get('pages'), {
                        id: change.pageId
                    });

                    if (is.not.undefined(pageContent)) {
                        pageContent.set('sequence', change.sequence);
                    }
                });

                self.set('pages', _.sortBy(self.get('pages'), "sequence"));
            });
        },

        onPageLevelChange(changes) {
            let self = this;

            this.get('documentService').changePageLevel(this.model.get('id'), changes).then(function() {
                _.each(changes, function(change) {
                    let pageContent = _.findWhere(self.get('pages'), {
                        id: change.pageId
                    });

                    if (is.not.undefined(pageContent)) {
                        pageContent.set('level', change.level);
                    }
                });

                let pages = self.get('pages');
                pages = _.sortBy(pages, "sequence");
                self.set('pages', []);
                self.set('pages', pages);
            });
        },

        onAttachmentUpload() {
            this.getAttachments();
        },

        onAttachmentDeleted(id) {
            let self = this;
            this.get('documentService').deleteAttachment(this.model.get('id'), id).then(function() {
                self.getAttachments();
            });
        },

        onPageDeleted(deletePage) {
            let self = this;
            let documentId = this.get('model.id');
            let pages = this.get('pages');
            let deleteId = deletePage.id;
            let deleteChildren = deletePage.children;
            let page = _.findWhere(pages, {
                id: deleteId
            });
            let pageIndex = _.indexOf(pages, page, false);
            let pendingChanges = [];

            // select affected pages
            for (var i = pageIndex + 1; i < pages.length; i++) {
                if (pages[i].level <= page.level) {
                    break;
                }

                pendingChanges.push({
                    pageId: pages[i].id,
                    level: pages[i].level - 1
                });
            }

            if (deleteChildren) {
                // nuke of page tree
                pendingChanges.push({
                    pageId: deleteId
                });

                this.get('documentService').deletePages(documentId, deleteId, pendingChanges).then(function() {
                    // update our models so we don't have to reload from db
                    for (var i = 0; i < pendingChanges.length; i++) {
                        let pageId = pendingChanges[i].pageId;
                        self.set('pages', _.reject(self.get('pages'), function(p) { //jshint ignore: line
                            return p.id === pageId;
                        }));
                    }

                    self.set('pages', _.sortBy(self.get('pages'), "sequence"));

                    self.audit.record("deleted-page");

                    // fetch document meta
                    self.get('documentService').getMeta(self.model.get('id')).then(function(meta) {
                        self.set('meta', meta);
                    });
                });
            } else {
                // page delete followed by re-leveling child pages
                this.get('documentService').deletePage(documentId, deleteId).then(function() {
                    self.set('pages', _.reject(self.get('pages'), function(p) {
                        return p.id === deleteId;
                    }));

                    self.audit.record("deleted-page");

                    // fetch document meta
                    self.get('documentService').getMeta(self.model.get('id')).then(function(meta) {
                        self.set('meta', meta);
                    });
                });

                self.send('onPageLevelChange', pendingChanges);
            }
        },

        onDocumentChange(doc) {
            let self = this;
            this.get('documentService').save(doc).then(function() {
                self.set('model', doc);
            });
        },

        onAddPage(page) {
            let self = this;

            this.get('documentService').addPage(this.get('model.id'), page).then(function(newPage) {
                self.transitionToRoute('document.edit',
                    self.get('folder.id'),
                    self.get('folder.slug'),
                    self.get('model.id'),
                    self.get('model.slug'),
                    newPage.id);
            });
        }
    }
});