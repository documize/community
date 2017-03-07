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
import TooltipMixin from '../../mixins/tooltip';
import NotifierMixin from '../../mixins/notifier';

export default Ember.Component.extend(TooltipMixin, NotifierMixin, {
    documentService: Ember.inject.service('document'),
	sectionService: Ember.inject.service('section'),
	appMeta: Ember.inject.service(),
	userService: Ember.inject.service('user'),
	localStorage: Ember.inject.service(),
	pinned: Ember.inject.service(),
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
	tab: '',

	init() {
		this._super(...arguments);

		if (is.empty(this.get('tab'))) {
			this.set('tab', 'index');
		}
	},

	didReceiveAttrs() {
		this._super(...arguments);
		
		this.set('saveTemplate.name', this.get('document.name'));
		this.set('saveTemplate.description', this.get('document.excerpt'));
		
		this.set('pinState.pinId', this.get('pinned').isDocumentPinned(this.get('document.id')));
		this.set('pinState.isPinned', this.get('pinState.pinId') !== '');
		this.set('pinState.newName', this.get('document.name').substring(0,3).toUpperCase());	
	},

	didRender() {
		this._super(...arguments);
	},

	didInsertElement() {
		this._super(...arguments);
	},

	willDestroyElement() {
		this._super(...arguments);
	},

    actions: {
		onChangeTab(tab) {
			this.set('tab', tab);
		},

		onTagChange(tags) {
			let doc = this.get('document');
			doc.set('tags', tags);
			this.get('documentService').save(doc);
		},

		onMenuOpen() {
			this.set('menuOpen', !this.get('menuOpen'));
		},

		onDeleteDocument() {
			this.attrs.onDocumentDelete();
		},

		onPrintDocument() {
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
			this.audit.record('unpinned-document');

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

			this.audit.record('pinned-document');

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
		}
    }
});
