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
import { A } from '@ember/array';
import { empty, and } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import { set } from '@ember/object';
import { inject as service } from '@ember/service';
import { schedule } from '@ember/runloop';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(Notifier, {
	appMeta: service(),
	router: service(),
	i18n: service(),
	maxTags: 3,
	domain: '',
	titleEmpty: empty('model.general.title'),
	messageEmpty: empty('model.general.message'),
	conversionEndpointEmpty: empty('model.general.conversionEndpoint'),
	hasTitleInputError: and('titleEmpty', 'titleError'),
	hasMessageInputError: and('messageEmpty', 'messageError'),
	hasConversionEndpointInputError: and('conversionEndpointEmpty', 'conversionEndpointError'),
	locale: { name: '' },
	locales: A([]),

	init(...args) {
		this._super(...args);

		let l = this.get('appMeta.locales');
		let t = A([]);

		l.forEach((locale) => {
			t.pushObject({ name: locale });
		});

		this.set('locales', t);
	},

	didReceiveAttrs() {
		this._super(...arguments);

		this.set('maxTags', this.get('model.general.maxTags'));
		this.set('domain', this.get('model.general.domain'));

		this.set('locale', this.locales.findBy('name', this.get('model.general.locale')));
	},

	didInsertElement() {
		this._super(...arguments);

		let self = this;
		let url = this.get('appMeta.endpoint');
		let orgId = this.get('appMeta.orgId');
		let uploadUrl = `${url}/organization/${orgId}/logo`;

		// Handle upload clicks on button and anything inside that button.
		let sel = ['#upload-logo', '#upload-logo > div'];
		for (var i=0; i < 2; i++) {
			let dzone = new Dropzone(sel[i], {
				headers: {
					'Authorization': 'Bearer ' + self.get('session.authToken')
				},
				url: uploadUrl,
				method: "post",
				paramName: 'attachment',
				clickable: true,
				maxFilesize: 50,
				parallelUploads: 1,
				uploadMultiple: false,
				addRemoveLinks: false,
				autoProcessQueue: true,
				createImageThumbnails: false,

				init: function () {
					this.on("success", function (/*file, response*/ ) {
					});

					this.on("queuecomplete", function () {
						self.notifySuccess(this.i18n.localize('saved'));
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

		schedule('afterRender', () => {
			let options = {
				cache_suffix: '?v=513',
				selector: '#editor-message',
				relative_urls: false,
				browser_spellcheck: true,
				contextmenu: false,
				statusbar: false,
				inline: false,
				paste_data_images: true,
				images_upload_handler: function (blobInfo, success, failure) { // eslint-disable-line no-unused-vars
					success("data:" + blobInfo.blob().type + ";base64," + blobInfo.base64());
				},
				image_advtab: true,
				image_caption: true,
				media_live_embeds: true,
				theme: 'silver',
				skin: 'oxide',
				entity_encoding: 'raw',
				extended_valid_elements: 'b,i,b/strong,i/em',
				fontsize_formats:
					'8px 10px 12px 14px 16px 18px 20px 22px 24px 26px 28px 30px 32px 34px 36px 38px 40px 42px 44px 46px 48px 50px 52px 54px 56px 58px 60px 70px 80px 90px 100px',
				formats: {
					bold: {
						inline: 'b'
					},
					italic: {
						inline: 'i'
					}
				},

				plugins: [
					'advlist autolink autoresize lists link image charmap print hr pagebreak',
					'searchreplace wordcount visualblocks visualchars',
					'insertdatetime media nonbreaking save table directionality',
					'template paste textpattern imagetools'
				],
				menu: {},
				menubar: false,
				toolbar: [
					'formatselect fontsizeselect | bold italic underline strikethrough superscript subscript blockquote | forecolor backcolor link unlink',
					'outdent indent bullist numlist | alignleft aligncenter alignright alignjustify | table uploadimage image media'
				],
			};

			if (typeof tinymce === 'undefined') {
				$.getScript('/tinymce/tinymce.min.js?v=513', function () {
					window.tinymce.dom.Event.domLoaded = true;
					tinymce.baseURL = '//' + window.location.host + '/tinymce';
					tinymce.suffix = '.min';
					tinymce.init(options);
				});
			} else {
				tinymce.init(options);
			}
		});
	},

	willDestroyElement() {
		this._super(...arguments);

		tinymce.EditorManager.execCommand('mceRemoveEditor', true, 'editor-message');
	},

	actions: {
		onSelectLocale(locale) {
			this.set('model.general.locale', locale.name);
		},

		change() {
            const selectEl = $('#maxTags')[0];
            const selection = selectEl.selectedOptions[0].value;

			this.set('maxTags', parseInt(selection));
        },

		save() {
			let editor = tinymce.EditorManager.get('editor-message');
			let message = editor.getContent();

			if (isEmpty(this.get('model.general.title'))) {
				set(this, 'titleError', true);
				return $("#siteTitle").focus();
			}

			if (isEmpty(message)) {
				set(this, 'messageError', true);
				return editor.focus();
			}

			if (isEmpty(this.get('model.general.conversionEndpoint'))) {
				set(this, 'conversionEndpointError', true);
				return $("#conversionEndpoint").focus();
			}

			let e = this.get('model.general.conversionEndpoint');
			if (_.endsWith(e, '/')) {
				this.set('model.general.conversionEndpoint', e.substring(0, e.length-1));
			}

			this.set('model.general.maxTags', this.get('maxTags'));
			this.set('model.general.message', message);

			let domainChanged = this.get('model.general.domain') !== this.get('domain').toLowerCase();
			this.set('model.general.domain', this.get('domain').toLowerCase());

			this.get('onUpdate')().then(() => {
				this.notifySuccess(this.i18n.localize('saved'));
				set(this, 'titleError', false);
				set(this, 'messageError', false);
				set(this, 'conversionEndpointError', false);

				if (domainChanged) {
					let router = this.get('router');
					router.transitionTo('auth.login');
				}
			});
		},

		onThemeChange(theme) {
			this.get('appMeta').setTheme(theme);
			this.set('model.general.theme', theme);
		},

		onDefaultLogo() {
			this.get('onDefaultLogo')(this.get('appMeta.orgId'));
			this.notifySuccess(this.i18n.localize('saved'));
		}
	}
});
