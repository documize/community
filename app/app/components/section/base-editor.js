import Ember from 'ember';

export default Ember.Component.extend({
    drop: null,
    cancelLabel: "Cancel",
    actionLabel: "Save",
    tip: "Short and concise title for the page",
    busy: false,

    didRender() {
        let self = this;
        Mousetrap.bind('esc', function() {
            self.send('onCancel');
            return false;
        });
        Mousetrap.bind(['ctrl+s', 'command+s'], function() {
            self.send('onAction');
            return false;
        });

        $("#page-title").removeClass("error");
    },

    willDestroyElement() {
        let drop = this.get('drop');

        if (is.not.null(drop)) {
            drop.destroy();
        }
    },

    actions: {
        onCancel() {
            if (this.attrs.isDirty() !== null && this.attrs.isDirty()) {
                $(".discard-edits-dialog").css("display", "block");

                let drop = new Drop({
                    target: $("#editor-cancel")[0],
                    content: $(".cancel-edits-dialog")[0],
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

                return;
            }

            this.attrs.onCancel();
        },

        onAction() {
            if (this.get('busy')) {
                return;
            }

            if (is.empty(this.get('page.title'))) {
                $("#page-title").addClass("error").focus();
                return;
            }

            this.attrs.onAction(this.get('page.title'));
        },

        keepEditing() {
            let drop = this.get('drop');
            drop.close();
        },

        discardEdits() {
            this.attrs.onCancel();
        }
    }
});