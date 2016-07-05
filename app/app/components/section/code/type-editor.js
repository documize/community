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
import TooltipMixin from '../../../mixins/tooltip';

export default Ember.Component.extend(TooltipMixin, {
    isDirty: false,
    pageBody: "",
    codeEditor: null,
    syntaxOptions: [],
    codeSyntax: null,

    didInitAttrs() {
        let self = this;
        CodeMirror.modeURL = "codemirror/mode/%N/%N.js";

        let rawBody = this.get('meta.rawBody');
        let cleanBody = rawBody.replace("</pre>", "");

        cleanBody = cleanBody.replace('<pre class="code-mirror cm-s-solarized cm-s-dark" data-lang="', "");
        let startPos = cleanBody.indexOf('">');
        let syntax = {
            mode: "html",
            name: "HTML"
        };

        if (startPos !== -1) {
            syntax = cleanBody.substring(0, startPos);
            cleanBody = cleanBody.substring(startPos + 2);
        }

        this.set('pageBody', cleanBody);

        let opts = [];

        _.each(_.sortBy(CodeMirror.modeInfo, 'name'), function(item) {
            let i = {
                mode: item.mode,
                name: item.name
            };
            opts.pushObject(i);

            if (item.mode === syntax) {
                self.set('codeSyntax', i);
            }
        });

        this.set('syntaxOptions', opts);

        // default check
        if (is.null(this.get("codeSyntax"))) {
            this.set("codeSyntax", opts.findBy("mode", "html"));
        }
    },

    didRender() {
        this.addTooltip(document.getElementById("set-syntax-zone"));
    },

    didInsertElement() {
        var editor = CodeMirror.fromTextArea(document.getElementById("code-editor"), {
            theme: "solarized dark",
            lineNumbers: true,
            lineWrapping: true,
            indentUnit: 4,
            tabSize: 4,
            value: "",
            dragDrop: false
        });

        editor.setSize("100%", $(document).height() - $(".document-editor > .toolbar").height() - 180);

        this.set('codeEditor', editor);

        let syntax = this.get("codeSyntax");

        if (is.not.undefined(syntax)) {
            CodeMirror.autoLoadMode(editor, syntax.mode);
            editor.setOption("mode", syntax.mode);
        }
    },

    willDestroyElement() {
        this.destroyTooltips();
        this.set('codeEditor', null);
    },

    // Wrap code in PRE tag with language identifier for subsequent rendering.
    getPRE() {
        let codeSyntax = this.get("codeSyntax.mode");
        let body = this.get('codeEditor').getDoc().getValue();

        return `<pre class="code-mirror cm-s-solarized cm-s-dark" data-lang="${codeSyntax}">${body}</pre>`;
    },

    actions: {
        onSyntaxChange(syntax) {
            let editor = this.get('codeEditor');
            CodeMirror.autoLoadMode(editor, syntax.mode);
            editor.setOption("mode", syntax.mode);

            this.set('isDirty', true);
            this.set('codeSyntax', syntax);
        },

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
            meta.set('rawBody', this.getPRE());

            this.attrs.onAction(page, meta);
        }
    }
});
