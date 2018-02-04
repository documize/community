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

import { computed, observer } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
    isDirty: false,
    diagramText: '',
    diagramPreview: null,
    config: null,

	editorId: computed('page', function () {
		let page = this.get('page');
		return `mermaid-editor-${page.id}`;
	}),
	previewId: computed('page', function () {
		let page = this.get('page');
		return `mermaid-preview-${page.id}`;
    }),
    // generateDiagram: observer('diagramText', function() {
    //     let txt = this.get('diagramText');
    //     console.log('calc diaggram');

    //     let self = this;
    //     var cb = function(svg) {
    //         return svg;
    //         // self.set('diagramPreview', svg);
    //     };

    //     if (is.empty(this.get('diagramText'))) return '';

    //     mermaid.render(this.get('previewId'), txt, cb);
    // }),

    keyUp() {
        this.generateDiagram();
    },

    generateDiagram() {
        console.log('calc diaggram');

        let txt = this.get('diagramText');
        if (is.empty(this.get('diagramText')))  this.set('diagramPreview', '');

        let self = this;
        var cb = function(svg) {
            self.set('diagramPreview', svg);
        };

        mermaid.render(this.get('previewId'), txt, cb);
    },
    
    didReceiveAttrs() {
        this._super(...arguments);
        let config = {};
        mermaid.initialize({});
        console.log('dra');

		try {
			config = JSON.parse(this.get('meta.config'));
		} catch (e) {} // eslint-disable-line no-empty

		if (is.empty(config)) {
			config = {
				txt: ""
			};
        }
        
        this.set('diagramText', config.txt);
        this.set('config', config);

        this.generateDiagram();
    },

	// onType: function() {
	// 	debounce(this, this.generateDiagram, 350);
    // }.observes('diagramText'),

    actions: {
        isDirty() {
            return this.get('isDirty') || (this.get('diagramText') !== this.get('config.txt'));
        },

        onCancel() {
            let cb = this.get('onCancel');
            cb();
        },

        onAction(title) {
            let page = this.get('page');
            let meta = this.get('meta');

            meta.set('config', JSON.stringify({ txt: this.get('diagramText') }));
            meta.set('rawBody', this.get('diagramPreview'));
            page.set('body', this.get('diagramPreview'));
            page.set('title', title);

            let cb = this.get('onAction');
            cb(page, meta);
        },

        onInsertFlowchart() {
            let txt  = `graph TB
            c1-->a2
            subgraph one
            a1-->a2
            end
            subgraph two
            b1-->b2
            end
            subgraph three
            c1-->c2
            end`;

            // this.set('diagramPreview', null);
            this.set('diagramText', txt);
            this.generateDiagram();
        },

        onInsertSequence() {
            let txt  = `sequenceDiagram
            participant Alice
            participant Bob
            Alice->John: Hello John, how are you?
            loop Healthcheck
                John->John: Fight against hypochondria
            end
            Note right of John: Rational thoughts <br/>prevail...
            John-->Alice: Great!
            John->Bob: How about you?
            Bob-->John: Jolly good!`;

            // this.set('diagramPreview', null);
            this.set('diagramText', txt);
            this.generateDiagram();
        },

        onInsertGantt() {
            let txt  = `gantt
            dateFormat  YYYY-MM-DD
            title Adding GANTT diagram functionality to mermaid
            section A section
            Completed task            :done,    des1, 2014-01-06,2014-01-08
            Active task               :active,  des2, 2014-01-09, 3d
            Future task               :         des3, after des2, 5d
            Future task2               :         des4, after des3, 5d
            section Critical tasks
            Completed task in the critical line :crit, done, 2014-01-06,24h
            Implement parser and jison          :crit, done, after des1, 2d
            Create tests for parser             :crit, active, 3d
            Future task in critical line        :crit, 5d
            Create tests for renderer           :2d
            Add to mermaid                      :1d`;

            // this.set('diagramPreview', null);
            this.set('diagramText', txt);
            this.generateDiagram();
        }
    }
});
