import Ember from 'ember';

export default Ember.Component.extend({
    isDirty: false,
    pageBody: "",

    didReceiveAttrs() {
        this.set("pageBody", this.get("meta.rawBody"));
    },

    didInsertElement() {
        let height = $(document).height() - $(".document-editor > .toolbar").height() - 130;
        $("#section-markdown-editor, #section-markdown-preview").css("height", height);

        this.renderPreview();
        let self = this;

        $("#section-markdown-editor").off("keyup").on("keyup", function() {
            self.renderPreview();
            self.set('isDirty', true);
        });
    },

    willDestroyElement() {
        $("#section-markdown-editor").off("keyup");
    },

    renderPreview() {
        let md = window.markdownit({
            linkify: true
        });
        let result = md.render(this.get("pageBody"));
        $("#section-markdown-preview").html(result);
    },

    actions: {
        isDirty() {
            return this.get('isDirty');
        },

        onCancel() {
            this.attrs.onCancel();
        },

        onAction(title) {
            let page = this.get('page');
            let meta = this.get('meta');
            page.set('title', title);
            meta.set('rawBody', this.get("pageBody"));

            this.attrs.onAction(page, meta);
        }
    }
});