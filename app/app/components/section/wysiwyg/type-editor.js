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

export default Ember.Component.extend({
    pageBody: "",

    didReceiveAttrs() {
        this.set('pageBody', this.get('meta.rawBody'));
    },

    didInsertElement() {
        let self = this;

        let options = {
            selector: "#rich-text-editor",
            relative_urls: false,
            cache_suffix: "?v=430",
            browser_spellcheck: false,
            gecko_spellcheck: false,
            theme: "modern",
            statusbar: false,
            height: $(document).height() - $(".document-editor > .toolbar").height() - 200,
            entity_encoding: "raw",
            paste_data_images: true,
            image_advtab: true,
            image_caption: true,
            media_live_embeds: true,
            fontsize_formats: "8pt 10pt 12pt 14pt 16pt 18pt 20pt 22pt 24pt 26pt 28pt 30pt 32pt 34pt 36pt",
            formats: {
                bold: {
                    inline: 'b'
                },
                italic: {
                    inline: 'i'
                }
            },
            extended_valid_elements: "b,i,b/strong,i/em",
            plugins: [
                'advlist autolink lists link image charmap print preview hr anchor pagebreak',
                'searchreplace wordcount visualblocks visualchars code codesample fullscreen',
                'insertdatetime media nonbreaking save table directionality',
                'emoticons template paste textcolor colorpicker textpattern imagetools'
            ],
            menu: {
                edit: {
                    title: 'Edit',
                    items: 'undo redo | cut copy paste pastetext | selectall | searchreplace'
                },
                insert: {
                    title: 'Insert',
                    items: 'anchor link media | hr | charmap emoticons | blockquote'
                },
                format: {
                    title: 'Format',
                    items: 'bold italic underline strikethrough superscript subscript | formats fonts | removeformat'
                },
                table: {
                    title: 'Table',
                    items: 'inserttable tableprops deletetable | cell row column'
                }
            },
            toolbar1: "formatselect fontselect fontsizeselect | bold italic underline | link unlink | image media | codesample | outdent indent | alignleft aligncenter alignright alignjustify | bullist numlist | forecolor backcolor",
            save_onsavecallback: function() {
                self.send('onAction');
            }
        };

        tinymce.init(options);
    },

    willDestroyElement() {
        tinymce.remove();
    },

    actions: {
        isDirty() {
            return is.not.undefined(tinymce) && is.not.undefined(tinymce.activeEditor) && tinymce.activeEditor.isDirty();
        },

        onCancel() {
            this.attrs.onCancel();
        },

        onAction(title) {
            let page = this.get('page');
            let meta = this.get('meta');

            page.set('title', title);
            meta.set('rawBody', tinymce.activeEditor.getContent());

            this.attrs.onAction(page, meta);
        }
    }
});