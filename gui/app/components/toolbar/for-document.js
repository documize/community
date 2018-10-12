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

import $ from 'jquery';
import { inject as service } from '@ember/service';
import AuthMixin from '../../mixins/auth';
import TooltipMixin from '../../mixins/tooltip';
import ModalMixin from '../../mixins/modal';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(ModalMixin, TooltipMixin, AuthMixin, Notifier, {
	store: service(),
	spaceSvc: service('folder'),
	session: service(),
	appMeta: service(),
	pinned: service(),
	browserSvc: service('browser'),
	documentSvc: service('document'),

	init() {
		this._super(...arguments);

		this.pinState = {
			isPinned: false,
			pinId: '',
			newName: ''
		};
		this.saveTemplate = {
			name: '',
			description: ''
		};
	},

	didReceiveAttrs() {
		this._super(...arguments);

		let doc = this.get('document');

		this.get('pinned').isDocumentPinned(doc.get('id')).then((pinId) => {
			this.set('pinState.pinId', pinId);
			this.set('pinState.isPinned', pinId !== '');
			this.set('pinState.newName', doc.get('name'));
			this.renderTooltips();
		});

		this.set('saveTemplate.name', this.get('document.name'));
		this.set('saveTemplate.description', this.get('document.excerpt'));
	},

	didInsertElement() {
		this._super(...arguments);
		this.modalInputFocus('#document-template-modal', '#new-template-name');
	},

	willDestroyElement() {
		this._super(...arguments);
		this.removeTooltips();
	},

	actions: {
		onDocumentDelete() {
			this.modalClose('#document-delete-modal');

			let cb = this.get('onDocumentDelete');
			cb();
		},

		onPrintDocument() {
			window.print();
		},

		onUnpin() {
			this.get('pinned').unpinItem(this.get('pinState.pinId')).then(() => {
				$('#document-pin-button').tooltip('dispose');
				this.set('pinState.isPinned', false);
				this.set('pinState.pinId', '');
				this.eventBus.publish('pinChange');
				this.renderTooltips();
			});
		},

		onPin() {
			let pin = {
				pin: this.get('pinState.newName'),
				documentId: this.get('document.id'),
				spaceId: this.get('space.id')
			};

			this.get('pinned').pinItem(pin).then((pin) => {
				$('#document-pin-button').tooltip('dispose');
				this.set('pinState.isPinned', true);
				this.set('pinState.pinId', pin.get('id'));
				this.eventBus.publish('pinChange');
				this.renderTooltips();
			});

			return true;
		},

		onSaveTemplate() {
			let name = this.get('saveTemplate.name');
			let excerpt = this.get('saveTemplate.description');

			if (is.empty(name)) {
				$("#new-template-name").addClass("is-invalid").focus();
				return;
			}

			if (is.empty(excerpt)) {
				$("#new-template-desc").addClass("is-invalid").focus();
				return;
			}

			$("#new-template-name").removeClass("is-invalid");
			$("#new-template-desc").removeClass("is-invalid");

			this.set('saveTemplate.name', '');
			this.set('saveTemplate.description', '');

			let cb = this.get('onSaveTemplate');
			cb(name, excerpt);

			this.modalClose('#document-template-modal');

			return true;
		},

		onExport() {
			this.showWait();

			let spec = {
				spaceId: this.get('document.folderId'),
				data: [],
				filterType: 'document',
			};

			spec.data.push(this.get('document.id'));

			this.get('documentSvc').export(spec).then((htmlExport) => {
				this.get('browserSvc').downloadFile(htmlExport, this.get('document.slug') + '.html');
				this.showDone();
			});
		}
	}
});
