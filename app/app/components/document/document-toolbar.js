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
import NotifierMixin from '../../mixins/notifier';
import TooltipMixin from '../../mixins/tooltip';

export default Ember.Component.extend(NotifierMixin, TooltipMixin, {
	appMeta: Ember.inject.service(),
	userService: Ember.inject.service('user'),
	localStorage: Ember.inject.service(),
	pinned: Ember.inject.service(),
	drop: null,
	users: [],
	menuOpen: false,
	saveTemplate: {
		name: "",
		description: ""
	},
	pinState : {
		isPinned: false,
		pinId: '',
		newName: '',
	},

	didReceiveAttrs() {
		this.set('saveTemplate.name', this.get('document.name'));
		this.set('saveTemplate.description', this.get('document.excerpt'));

		let doc = this.get('document');

		this.set('layoutLabel', doc.get('layout') === 'doc' ? 'Wiki style' : 'Document style');

		this.set('pinState.pinId', this.get('pinned').isDocumentPinned(doc.get('id')));
		this.set('pinState.isPinned', this.get('pinState.pinId') !== '');
		this.set('pinState.newName', doc.get('name').substring(0,3).toUpperCase());
	},

	didRender() {
		if (this.session.isEditor) {
			this.addTooltip(document.getElementById("add-document-tab"));
		}
	},

	willDestroyElement() {
		this.destroyTooltips();
	},

	actions: {
		onMenuOpen() {
			this.set('menuOpen', !this.get('menuOpen'));
		},

		deleteDocument() {
			this.attrs.onDocumentDelete();
		},

		printDocument() {
			window.print();
		},

		changeLayout() {
			let doc = this.get('document');
			let layout = doc.get('layout') === 'doc' ? 'wiki' : 'doc';

			doc.set('layout', layout);

			this.attrs.onSaveMeta(doc);

			this.set('layoutLabel', doc.get('layout') === 'doc' ? 'Wiki style' : 'Document style');
		},

		saveTemplate() {
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

		saveMeta() {
			let doc = this.get('document');

			if (is.empty(doc.get('name'))) {
				$("#meta-name").addClass("error").focus();
				return false;
			}

			if (is.empty(doc.get('excerpt'))) {
				$("#meta-excerpt").addClass("error").focus();
				return false;
			}

			doc.set('excerpt', doc.get('excerpt').substring(0, 250));

			this.attrs.onSaveMeta(doc);
			return true;
		},

		unpin() {
			this.audit.record('unpinned-document');

			this.get('pinned').unpinItem(this.get('pinState.pinId')).then(() => {
				this.set('pinState.isPinned', false);
				this.set('pinState.pinId', '');
				this.eventBus.publish('pinChange');
			});
		},

		pin() {
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
		}
	}
});
