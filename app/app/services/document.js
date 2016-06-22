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
    ajax: Ember.inject.service(),

    // Returns document model for specified document id.
    getDocument(documentId) {
        let url = this.get('sessionService').appMeta.getUrl(`documents/${documentId}`);

        return this.get('ajax').request(url, {
            method: "GET"
        }).then((response) => {
            return models.DocumentModel.create(response);
        });
    },

    // Returns all documents for specified folder.
    getAllByFolder(folderId) {
        let appMeta = this.get('sessionService.appMeta');
        let url = appMeta.getUrl(`documents?folder=${folderId}`);

        return this.get('ajax').request(url, {
            method: "GET"
        }).then((response) => {
            let documents = Ember.ArrayProxy.create({
                content: Ember.A([])
            });

            _.each(response, function(doc) {
                let documentModel = models.DocumentModel.create(doc);
                documents.pushObject(documentModel);
            });

            return documents;
        });
    },

    // getDocumentsByTag returns all documents for specified tag (not folder!).
    getAllByTag(tag) {
        let url = this.get('sessionService').appMeta.getUrl(`documents?filter=tag&tag=${tag}`);

        return this.get('ajax').request(url, {
            method: "GET"
        }).then((response) => {
            let documents = Ember.ArrayProxy.create({
                content: Ember.A([])
            });

            _.each(response, function(doc) {
                let documentModel = models.DocumentModel.create(doc);
                documents.pushObject(documentModel);
            });

            return documents;
        });
    },

    // saveDocument updates an existing document record.
    save(doc) {
        let id = doc.get('id');
        let url = this.get('sessionService').appMeta.getUrl(`documents/${id}`);

        return this.get('ajax').request(url, {
            method: 'PUT',
            data: JSON.stringify(doc)
        });
    },

    getBatchedPages: function(documentId, payload) {
        let url = this.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/batch");

        return this.get('ajax').request(url, {
            method: 'POST',
            data: payload
        }).then((pages) => {
            if (is.not.array(pages)) {
                pages = [];
            }

            return pages;
        });
    },

    changePageSequence: function(documentId, payload) {
        var url = this.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/sequence");

        return this.get('ajax').post(url, {
            data: JSON.stringify(payload),
            contentType: 'json'
        });
    },

    changePageLevel(documentId, payload) {
        let url = this.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/level");

        return this.get('ajax').post(url, {
            data: JSON.stringify(payload),
            contentType: 'json'
        });
    },

    deleteDocument: function(documentId) {
        let url = this.get('sessionService').appMeta.getUrl("documents/" + documentId);

        return this.get('ajax').request(url, {
            method: 'DELETE'
        });
    },

    updatePage: function(documentId, pageId, payload, skipRevision) {
        var revision = skipRevision ? "?r=true" : "?r=false";
        let url = this.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/" + pageId + revision);

        return this.get('ajax').request(url, {
            method: 'PUT',
            data: JSON.stringify(payload),
            contentType: 'json'
        });
    },

    // addPage inserts new page to an existing document.
    addPage: function(documentId, payload) {
        let url = this.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages");

        return this.get('ajax').post(url, {
            data: JSON.stringify(payload),
            contentType: 'json'
        });
    },

    // Nukes multiple pages from the document.
    deletePages: function(documentId, pageId, payload) {
        let url = this.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/" + pageId);

        return this.get('ajax').post(url, {
            data: JSON.stringify(payload),
            contentType: 'json'
        });
    },

    // Nukes a single page from the document.
    deletePage: function(documentId, pageId) {
        let url = this.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/" + pageId);

        return this.get('ajax').request(url, {
            method: 'DELETE'
        });
    },

    getPageRevisions(documentId, pageId) {
        let url = this.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/" + pageId + "/revisions");

        return this.get('ajax').request(url, {
            method: "GET"
        });
    },

    getPageRevisionDiff(documentId, pageId, revisionId) {
        let url = this.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/" + pageId + "/revisions/" + revisionId);

        return this.get('ajax').request(url, {
            method: "GET",
            dataType: 'text'
        });
    },

    rollbackPage(documentId, pageId, revisionId) {
        let url = this.get('sessionService').appMeta.getUrl("documents/" + documentId + "/pages/" + pageId + "/revisions/" + revisionId);

        return this.get('ajax').request(url, {
            method: "POST"
        });
    },

    // document meta referes to number of views, edits, approvals, etc.
    getMeta(documentId) {
        let url = this.get('sessionService').appMeta.getUrl(`documents/${documentId}/meta`);

        return this.get('ajax').request(url, {
            method: "GET"
        });
    },

    // Returns all pages without the content
    getTableOfContents(documentId) {
        let url = this.get('sessionService').appMeta.getUrl(`documents/${documentId}/pages?content=0`);

        return this.get('ajax').request(url, {
            method: 'GET'
        }).then((response) => {
            let data = [];
            _.each(response, function(obj) {
                data.pushObject(models.PageModel.create(obj));
            });

            return data;
        });
    },

    // Returns all document pages with content
    getPages(documentId) {
        let url = this.get('sessionService').appMeta.getUrl(`documents/${documentId}/pages`);

        return this.get('ajax').request(url, {
            method: 'GET'
        }).then((response) => {
            let pages = [];

            _.each(response, function(page) {
                pages.pushObject(models.PageModel.create(page));
            });

            return pages;
        });
    },

    // Returns document page with content
    getPage(documentId, pageId) {
        let url = this.get('sessionService').appMeta.getUrl(`documents/${documentId}/pages/${pageId}`);

        return this.get('ajax').request(url, {
            method: 'GET'
        }).then((response) => {
            let page = models.PageModel.create(response);
            return page;
        });
    },

    // Returns document page meta object
    getPageMeta(documentId, pageId) {
        let url = this.get('sessionService').appMeta.getUrl(`documents/${documentId}/pages/${pageId}/meta`);

        return this.get('ajax').request(url, {
            method: 'GET'
        }).then((response) => {
            let meta = models.PageMetaModel.create(response);
            return meta;
        });
    },

    // document attachments without the actual content
    getAttachments(documentId) {
        let url = this.get('sessionService').appMeta.getUrl(`documents/${documentId}/attachments`);

        return this.get('ajax').request(url, {
            method: 'GET'
        }).then((response) => {
            let data = [];
            _.each(response, function(obj) {
                data.pushObject(models.AttachmentModel.create(obj));
            });
            return data;
        });
    },

    // nuke an attachment
    deleteAttachment(documentId, attachmentId) {
        let url = this.get('sessionService').appMeta.getUrl(`documents/${documentId}/attachments/${attachmentId}`);

        return this.get('ajax').request(url, {
            method: 'DELETE'
        });
    },
});
