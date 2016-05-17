// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under 
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>. 
//
// https://documize.com

import Ember from 'ember';
import models from '../utils/model';

export default Ember.Service.extend({
    sessionService: Ember.inject.service('session'),

    // Returns document model for specified document id.
    getDocument(documentId) {
        let url = this.get('sessionService').appMeta.getUrl(`documents/${documentId}`);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {
                    let doc = models.DocumentModel.create(response);
                    resolve(doc);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // Returns all documents for specified folder.
    getAllByFolder(folderId) {
        let url = this.get('sessionService').appMeta.getUrl(`documents?folder=${folderId}`);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {
                    let documents = Ember.ArrayProxy.create({
                        content: Ember.A([])
                    });

                    _.each(response, function(doc) {
                        let documentModel = models.DocumentModel.create(doc);
                        documents.pushObject(documentModel);
                    });

                    resolve(documents);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // getDocumentsByTag returns all documents for specified tag (not folder!).
    getAllByTag(tag) {
        let url = this.get('sessionService').appMeta.getUrl(`documents?filter=tag&tag=${tag}`);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {
                    let documents = Ember.ArrayProxy.create({
                        content: Ember.A([])
                    });

                    _.each(response, function(doc) {
                        let documentModel = models.DocumentModel.create(doc);
                        documents.pushObject(documentModel);
                    });

                    resolve(documents);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // saveDocument updates an existing document record.
    save(doc) {
        let id = doc.get('id');
        let url = this.get('sessionService').appMeta.getUrl(`documents/${id}`);

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(doc),
                contentType: 'json',
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    getBatchedPages: function(documentId, payload) {
        var self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/batch"),
                type: 'POST',
                data: payload,
                success: function(pages) {
                    if (is.not.array(pages)) {
                        pages = [];
                    }

                    resolve(pages);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    changePageSequence: function(documentId, payload) {
        var self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/sequence"),
                type: 'POST',
                data: JSON.stringify(payload),
                contentType: 'json',
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    changePageLevel(documentId, payload) {
        var self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/level"),
                type: 'POST',
                data: JSON.stringify(payload),
                contentType: 'json',
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    deleteDocument: function(documentId) {
        var self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl("documents/" + documentId),
                type: 'DELETE',
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    updatePage: function(documentId, pageId, payload, skipRevision) {
        var self = this;
        var revision = skipRevision ? "?r=true" : "?r=false";

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/" + pageId + revision),
                type: 'PUT',
                data: JSON.stringify(payload),
                contentType: 'json',
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // addPage inserts new page to an existing document.
    addPage: function(documentId, payload) {
        var self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages"),
                type: 'POST',
                data: JSON.stringify(payload),
                contentType: 'json',
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // Nukes multiple pages from the document.
    deletePages: function(documentId, pageId, payload) {
        var self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/" + pageId),
                type: 'POST',
                data: JSON.stringify(payload),
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // Nukes a single page from the document.
    deletePage: function(documentId, pageId) {
        var self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/" + pageId),
                type: 'DELETE',
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    getPageRevisions(documentId, pageId) {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/" + pageId + "/revisions"),
                type: 'GET',
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    getPageRevisionDiff(documentId, pageId, revisionId) {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/" + pageId + "/revisions/" + revisionId),
                type: 'GET',
                dataType: 'text',
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    rollbackPage(documentId, pageId, revisionId) {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/" + pageId + "/revisions/" + revisionId),
                type: 'POST',
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // document meta referes to number of views, edits, approvals, etc.
    getMeta(documentId) {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl(`documents/${documentId}/meta`),
                type: 'GET',
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // Returns all pages without the content
    getTableOfContents(documentId) {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl(`documents/${documentId}/pages?content=0`),
                type: 'GET',
                success: function(response) {
                    let data = [];
                    _.each(response, function(obj) {
                        data.pushObject(models.PageModel.create(obj));
                    });
                    resolve(data);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // Returns all document pages with content
    getPages(documentId) {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl(`documents/${documentId}/pages`),
                type: 'GET',
                success: function(response) {
                    let pages = [];

                    _.each(response, function(page) {
                        pages.pushObject(models.PageModel.create(page));
                    });

                    if (pages.length > 0) {
                        Ember.set(pages[0], 'firstPage', true);
                    }

                    resolve(pages);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // Returns document page with content
    getPage(documentId, pageId) {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl(`documents/${documentId}/pages/${pageId}`),
                type: 'GET',
                success: function(response) {
                    let page = models.PageModel.create(response);
                    resolve(page);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // Returns document page meta object
    getPageMeta(documentId, pageId) {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl(`documents/${documentId}/pages/${pageId}/meta`),
                type: 'GET',
                success: function(response) {
                    let meta = models.PageMetaModel.create(response);
                    resolve(meta);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // document attachments without the actual content
    getAttachments(documentId) {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl(`documents/${documentId}/attachments`),
                type: 'GET',
                success: function(response) {
                    let data = [];
                    _.each(response, function(obj) {
                        data.pushObject(models.AttachmentModel.create(obj));
                    });
                    resolve(data);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },

    // nuke an attachment
    deleteAttachment(documentId, attachmentId) {
        let self = this;

        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.ajax({
                url: self.get('sessionService').appMeta.getUrl(`documents/${documentId}/attachments/${attachmentId}`),
                type: 'DELETE',
                success: function(response) {
                    resolve(response);
                },
                error: function(reason) {
                    reject(reason);
                }
            });
        });
    },
});