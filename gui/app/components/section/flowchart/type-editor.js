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
	orgService: service('organization'),
	i18n: service(),
    isDirty: false,
    waiting: false,
    diagram: '',
	diagramXML: '',
	title: '',
	readyToSave: false,
	previewButtonCaption: '',
	flowCallback: null,
	serviceUrl: '',
	editorId: computed('page', function () {
		let page = this.get('page');
		return `flowchart-editor-${page.id}`;
	}),

	didReceiveAttrs() {
		this._super(...arguments);

		this.set('waiting', false);
        this.set('diagram', this.get('meta.rawBody'));
		this.set('title', this.get('page.title'));
	},

    didInsertElement() {
		this._super(...arguments);

		let orgId = this.get("appMeta.orgId");
		this.get('orgService').getOrgSetting(orgId, 'flowchart').then((s) => {
			this.set('serviceUrl', s.url);

			this.previewButtonCaption = this.i18n.localize('preview');

			schedule('afterRender', () => {
				this.setupEditor();
			});
		});
	},

	willDestroyElement() {
		this._super(...arguments);
		this.teardownEditor();
	},

	setupEditor() {
		let self = this;

		let flowCallback = function(evt) {
			if (self.get('isDestroyed') || self.get('isDestroying')) {
				console.log('draw.io component destroyed'); // eslint-disable-line no-console
				return;
			}

			// if (evt.origin !== 'https://www.draw.io') {
			// 	console.log('draw.io incorrect message source: ' + evt.source); // eslint-disable-line no-console
			// 	return;
			// }

			if (evt.data.length === 0) {
				console.log('draw.io no event data'); // eslint-disable-line no-console
				return;
			}

			let editorFrame = document.getElementById(self.get('editorId'));
			var msg = JSON.parse(evt.data);

			switch (msg.event) {
				case 'init':
					editorFrame.contentWindow.postMessage(
						JSON.stringify({action: 'load', autosave: 1, xmlpng: self.get('diagram')}), '*');
					break;

				case 'save':
					self.set('diagramXML', msg.xml);
					self.invokeExport();
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

	invokeExport() {
		// Cannot export if nothing has been changed
		// so we skip straight to the save process.
		if (_.isEmpty(this.get('diagramXML'))) {
			this.set('readyToSave', true);
			return;
		}

		let editorFrame = document.getElementById(this.get('editorId'));

		editorFrame.contentWindow.postMessage(
			JSON.stringify(
				{
					action: 'export',
					format: 'xmlpng',
					xml: this.get('diagramXML'),
					spin: this.i18n.localize('updating')
				}
			), '*');
	},

	// eslint-disable-next-line ember/no-observers
	goSave: observer('readyToSave', function() {
		if (this.get('readyToSave')) {
			let page = this.get('page');
			let meta = this.get('meta');

			// handle case where no diagram changes were made
			let dg = this.get('diagram');
			if (_.isEmpty(dg)) dg = this.get('meta.rawBody');

			meta.set('rawBody', dg);
			page.set('title', this.get('title'));

			this.set('waiting', false);
			this.get('onAction')(page, meta);
		}
	}),

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
			this.invokeExport();
		}
    }
});

// https://github.com/jgraph/drawio-html5/blob/master/localstorage.html
// https://desk.draw.io/support/solutions/articles/16000042546-what-url-parameters-are-supported-
// https://desk.draw.io/support/solutions/articles/16000042544-how-does-embed-mode-work-
// https://jgraph.github.io/mxgraph/docs/js-api/files/editor/mxEditor-js.html

// https://github.com/jgraph/drawio-github/blob/master/edit-diagram.html
// https://github.com/jgraph/drawio-integration
// https://desk.draw.io/support/solutions/articles/16000042544-embed-mode
