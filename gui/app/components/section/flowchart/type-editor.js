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

import { schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
	appMeta: service(),
	sectionSvc: service('section'),
    isDirty: false,
    waiting: false,
    diagram: '',
	diagramXML: '',
	title: '',
	readyToSave: false,
	previewButtonCaption: 'Preview',
	flowCallback: null,
	editorId: computed('page', function () {
		let page = this.get('page');
		return `flowchart-editor-${page.id}`;
	}),

	goSave: observer('readyToSave', function() {
		if (this.get('readyToSave')) {
			let page = this.get('page');
			let meta = this.get('meta');
			meta.set('rawBody', this.get('diagram'));
			page.set('title', this.get('title'));

			this.set('waiting', false);
			this.teardownEditor();
			this.get('onAction')(page, meta);
		}
	}),

	didReceiveAttrs() {
		this._super(...arguments);

		this.set('waiting', false);
        this.set('diagram', this.get('meta.rawBody'));
		this.set('title', this.get('page.title'));
	},

    didInsertElement() {
		this._super(...arguments);
		schedule('afterRender', () => {
			this.setupEditor();
		});
	},

	willDestroyElement() {
		this._super(...arguments);
		this.teardownEditor();
	},

	setupEditor() {
		let self = this;

		let flowCallback = function(evt) {
			if (self.get('isDestroyed') || self.get('isDestroying')) return;
			if (evt.origin !== 'https://www.draw.io') return;
			if (evt.data.length === 0) return;

			let editorFrame = document.getElementById(self.get('editorId'));
			var msg = JSON.parse(evt.data);

			switch (msg.event) {
				case 'init':
					editorFrame.contentWindow.postMessage(
						JSON.stringify({action: 'load', autosave: 1, xmlpng: self.get('diagram')}), '*');
					break;

				case 'save':
					self.set('diagramXML', msg.xml);
					// Trigger onAction() callback using sneaky trick.
					Mousetrap.trigger('ctrl+s');
				break;

				case 'autosave':
					self.set('diagramXML', msg.xml);
				break;

				case 'load':
					break;

				case 'exit':
					self.sendAction('onCancel');
					break;

				case 'export':
					self.set('diagram', msg.data);
					self.set('readyToSave', true);
					break;
			}
		};

		window.addEventListener('message', flowCallback);
		this.set('flowCallback', flowCallback);
	},

	teardownEditor() {
		window.removeEventListener('message', this.get('flowCallback'));
	},

    actions: {
        isDirty() {
            return this.get('isDirty') || (this.get('diagram') !== this.get('meta.rawBody'));
        },

        onCancel() {
			this.teardownEditor();
            this.get('onCancel')();
        },

        onAction(title) {
			this.set('waiting', true);
			this.set('title', title);

			let editorFrame = document.getElementById(this.get('editorId'));
			editorFrame.contentWindow.postMessage(JSON.stringify({action: 'export', format: 'xmlpng', xml: this.get('diagramXML'), spin: 'Updating'}), '*');
		}
    }
});

// https://github.com/jgraph/drawio-html5/blob/master/localstorage.html
// https://desk.draw.io/support/solutions/articles/16000042546-what-url-parameters-are-supported-
// https://desk.draw.io/support/solutions/articles/16000042544-how-does-embed-mode-work-
// https://jgraph.github.io/mxgraph/docs/js-api/files/editor/mxEditor-js.html