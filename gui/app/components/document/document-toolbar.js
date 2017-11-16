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

import { inject as service } from '@ember/service';

import Component from '@ember/component';
import TooltipMixin from '../../mixins/tooltip';
import NotifierMixin from '../../mixins/notifier';

export default Component.extend(TooltipMixin, NotifierMixin, {
    documentService: service('document'),
	sectionService: service('section'),
	sessionService: service('session'),
	appMeta: service(),
	userService: service('user'),
	localStorage: service(),
	pinned: service(),
	menuOpen: false,
	pinState : {
		isPinned: false,
		pinId: '',
		newName: '',
	},
	saveTemplate: {
		name: "",
		description: ""
	},

	init() {
		this._super(...arguments);
	},

	didReceiveAttrs() {
		this._super(...arguments);

		this.set('saveTemplate.name', this.get('document.name'));
		this.set('saveTemplate.description', this.get('document.excerpt'));

		this.get('pinned').isDocumentPinned(this.get('document.id')).then( (pinId) => {
			this.set('pinState.pinId', pinId);
			this.set('pinState.isPinned', pinId !== '');
		});

		this.set('pinState.newName', this.get('document.name'));
	},

	didRender() {
		this.destroyTooltips();

		if (this.get('permissions.documentEdit')) {
			this.addTooltip(document.getElementById("document-activity-button"));
		}
	},

    actions: {
		onMenuOpen() {
			this.set('menuOpen', !this.get('menuOpen'));
		},

		onDeleteDocument() {
			this.attrs.onDocumentDelete();
		},

		onPrintDocument() {
			$("#sidebar-zone-more-button").click();
			window.print();
		},

		onPageSequenceChange(changes) {
			this.get('onPageSequenceChange')(changes);
		},

		onPageLevelChange(changes) {
			this.get('onPageLevelChange')(changes);
		},

		onGotoPage(id) {
			this.get('onGotoPage')(id);
		},

		onUnpin() {
			this.get('pinned').unpinItem(this.get('pinState.pinId')).then(() => {
				this.set('pinState.isPinned', false);
				this.set('pinState.pinId', '');
				this.eventBus.publish('pinChange');
			});
		},

		onPin() {
			let pin = {
				pin: this.get('pinState.newName'),
				documentId: this.get('document.id'),
				folderId: this.get('folder.id')
			};

			if (is.empty(pin.pin)) {
				$("#pin-document-name").addClass("error").focus();
				return false;
			}

			this.get('pinned').pinItem(pin).then((pin) => {
				this.set('pinState.isPinned', true);
				this.set('pinState.pinId', pin.get('id'));
				this.eventBus.publish('pinChange');
			});

			return true;
		},

		onSaveTemplate() {
			var name = this.get('saveTemplate.name');
			var excerpt = this.get('saveTemplate.description');

			if (is.empty(name)) {
				$("#new-template-name").addClass("error").focus();
				return false;
			}

			if (is.empty(excerpt)) {
				$("#new-template-desc").addClass("error").focus();
				return false;
			}

			this.showNotification('Template saved');
			this.attrs.onSaveTemplate(name, excerpt);

			return true;
		},

		onLayoutChange(layout) {
			let doc = this.get('document');
			doc.set('layout', layout);

			if (this.get('permissions.documentEdit')) {
				this.get('documentService').save(doc);
			}

			return true;
		}
    }
});
