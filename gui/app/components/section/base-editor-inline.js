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
import { empty, notEmpty } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Modals from '../../mixins/modal';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(Modals, Notifier, {
	appMeta: service(),
	session: service(),
	documentSvc: service('document'),
	busy: false,
	mousetrap: null,
	showLinkModal: false,
	files: null,
	downloadQuery: '',
	hasAttachments: notEmpty('files'),
	hasNameError: empty('page.title'),
	hasDescError: empty('page.excerpt'),
	pageId: computed('page', function () {
		let page = this.get('page');
		return `page-editor-${page.id}`;
	}),
	uploadId: computed('page', function () {
		let page = this.get('page');
		return `page-uploader-${page.id}`;
	}),
	previewText: 'Preview',
	pageTitle: '',

	didReceiveAttrs() {
		this._super(...arguments);
		this.set('pageTitle', this.get('page.title'));
	},

	didRender() {
		this._super(...arguments);

		let msContainer = document.getElementById('section-editor-' + this.get('containerId'));
		let mousetrap = this.get('mousetrap');
		if (_.isNull(mousetrap)) {
			mousetrap = new Mousetrap(msContainer);
		}

		mousetrap.bind('esc', () => {
			this.send('onCancel');
			return false;
		});
		mousetrap.bind(['ctrl+s', 'command+s'], () => {
			this.send('onAction');
			return false;
		});

		this.set('mousetrap', mousetrap);

		$('#' + this.get('pageId')).focus(function() {
			$(this).select();
		});
	},

	didInsertElement() {
		this._super(...arguments);

		let self = this;
		let documentId = this.get('document.id');
		let pageId = this.get('page.id');
		let url = this.get('appMeta.endpoint');
		let uploadUrl = `${url}/documents/${documentId}/attachments?page=${pageId}`;
		let uploadId = this.get('uploadId');

		// Handle upload clicks on button and anything inside that button.
		let sel = ['#' + uploadId, '#' + uploadId + ' > div'];
		for (var i=0; i < 2; i++) {
			let dzone = new Dropzone(sel[i], {
				headers: {
					'Authorization': 'Bearer ' + self.get('session.authToken')
				},
				url: uploadUrl,
				method: "post",
				paramName: 'attachment',
				clickable: true,
				maxFilesize: 250,
				parallelUploads: 5,
				uploadMultiple: false,
				addRemoveLinks: false,
				autoProcessQueue: true,

				init: function () {
					this.on("success", function (/*file, response*/ ) {
					});

					this.on("queuecomplete", function () {
						self.notifySuccess('Uploaded file');
						self.getAttachments();
					});

					this.on("addedfile", function ( /*file*/ ) {
					});

					this.on("error", function (error, msg) {
						self.notifyError(msg);
						self.notifyError(error);
					});
				}
			});

			dzone.on("complete", function (file) {
				dzone.removeFile(file);
			});
		}

		// For authenticated users we send server auth token.
		let qry = '';
		if (this.get('session.hasSecureToken')) {
			qry = '?secure=' + this.get('session.secureToken');
		} else if (this.get('session.authenticated')) {
			qry = '?token=' + this.get('session.authToken');
		}
		this.set('downloadQuery', qry);
	},

	willDestroyElement() {
		this._super(...arguments);
		this.set('showLinkModal', false);

		let mousetrap = this.get('mousetrap');
		if (!_.isNull(mousetrap)) {
			mousetrap.unbind('esc');
			mousetrap.unbind(['ctrl+s', 'command+s']);
		}
	},

	getAttachments() {
		this.get('documentSvc').getAttachments(this.get('document.id')).then((files) => {
			this.set('files', files);
		});
	},

	actions: {
		onAction() {
			if (this.get('busy') || _.isEmpty(this.get('pageTitle'))) {
				return;
			}

			if (this.get('isDestroyed') || this.get('isDestroying')) {
				return;
			}

			let cb = this.get('onAction');
			cb(this.get('pageTitle'));
		},

		onCancel() {
			let isDirty = this.get('isDirty');
			if (isDirty() !== null && isDirty()) {
				this.modalOpen('#discard-modal-' + this.get('page.id'), {show: true});
				return;
			}

			let cb = this.get('onCancel');
			cb();
		},

		onDiscard() {
			this.modalClose('#discard-modal-' + this.get('page.id'));
			let cb = this.get('onCancel');
			cb();
		},

		onPreview() {
			let pt = this.get('previewText');
			this.set('previewText', pt === 'Preview' ? 'Edit Mode' : 'Preview');
			return this.get('onPreview')();
		},

		onShowLinkModal() {
			this.set('showLinkModal', true);
		},

		onInsertLink(selection) {
			this.set('showLinkModal', false);
			return this.get('onInsertLink')(selection);
		}
	}
});
