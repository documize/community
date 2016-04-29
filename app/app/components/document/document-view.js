import Ember from 'ember';
import NotifierMixin from '../../mixins/notifier';
import TooltipMixin from '../../mixins/tooltip';

export default Ember.Component.extend(NotifierMixin, TooltipMixin, {
    documentService: Ember.inject.service('document'),
    sectionService: Ember.inject.service('section'),
    /* Parameters */
    document: null,
    // pages: [],
    attachments: [],
    folder: null,
    folders: [],
    isEditor: false,
    /* Internal */
    drop: null,
    deleteAttachment: {
        id: "",
        name: "",
    },
    deletePage: {
        id: "",
        title: "",
        children: false
    },

    didInsertElement() {
        let self = this;

        this.get('sectionService').refresh(this.get('document.id')).then(function(changes) {
            changes.forEach(function(newPage) {
                let oldPage = self.get('pages').findBy('id', newPage.get('id'));
                if (is.not.undefined(oldPage)) {
                    oldPage.set('body', newPage.body);
                    oldPage.set('revised', newPage.revised);
                    self.showNotification(`Refreshed ${oldPage.title}`);
                }
            });
        });
    },

    willDestroyElement() {
        this.destroyTooltips();

        let drop = this.get('drop');

        if (is.not.null(drop)) {
            drop.destroy();
        }
    },

    actions: {
        confirmDeleteAttachment(id, name) {
            this.set('deleteAttachment', {
                id: id,
                name: name
            });

            $(".delete-attachment-dialog").css("display", "block");

            let drop = new Drop({
                target: $(".delete-attachment-" + id)[0],
                content: $(".delete-attachment-dialog")[0],
                classes: 'drop-theme-basic',
                position: "bottom right",
                openOn: "always",
                tetherOptions: {
                    offset: "5px 0",
                    targetOffset: "10px 0"
                },
                remove: false
            });

            this.set('drop', drop);
        },

        cancel() {
            let drop = this.get('drop');
            drop.close();

            this.set('deleteAttachment', {
                id: "",
                name: ""
            });
        },

        deleteAttachment() {
            let attachment = this.get('deleteAttachment');
            let drop = this.get('drop');
            drop.close();

            this.showNotification(`Deleted ${attachment.name}`);
            this.attrs.onAttachmentDeleted(this.get('deleteAttachment').id);
            this.set('deleteAttachment', {
                id: "",
                name: ""
            });

            return true;
        },

        onDeletePage(id) {
            let page = this.get('pages').findBy("id", id);

            if (is.undefined(page)) {
                return;
            }

            this.set('deletePage', {
                id: id,
                title: page.get('title'),
                children: false
            });

            $(".delete-page-dialog").css("display", "block");

            let drop = new Drop({
                target: $("#page-toolbar-" + id)[0],
                content: $(".delete-page-dialog")[0],
                classes: 'drop-theme-basic',
                position: "bottom right",
                openOn: "always",
                tetherOptions: {
                    offset: "5px 0",
                    targetOffset: "10px 0"
                },
                remove: false
            });

            this.set('drop', drop);
        },

        deletePage() {
            let drop = this.get('drop');
            drop.close();

            this.attrs.onDeletePage(this.deletePage);
        },

        // onTagChange event emitted from document/tag-editor component
        onTagChange(tags) {
            let doc = this.get('document');
            doc.set('tags', tags);
            this.get('documentService').save(doc);
        }
    }
});