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
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { empty } from '@ember/object/computed';
import { schedule } from '@ember/runloop';
import AuthMixin from '../../mixins/auth';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(AuthMixin, Notifier, {
	router: service(),
	spaceSvc: service('folder'),
	iconSvc: service('icon'),
	localStorage: service('localStorage'),
	i18n: service(),
	isSpaceAdmin: computed('permissions', function() {
		return this.get('permissions.spaceOwner') || this.get('permissions.spaceManage');
	}),
	spaceName: '',
	hasNameError: empty('spaceName'),
	spaceTypeOptions: A([]),
	spaceType: 0,
	likes: '',
	allowLikes: false,
	spaceLifecycleOptions: A([]),
	spaceLifecycle: null,
	iconList: A([]),
	spaceIcon: '',
	spaceDesc: '',
	spaceLabel: '',

	init() {
		this._super(...arguments);

		this.set('iconList', this.get('iconSvc').getSpaceIconList());
	},

	didInsertElement() {
		this._super(...arguments);

		schedule('afterRender', () => {
			let options = {
				cache_suffix: '?v=513',
				selector: '#space-desc',
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

		tinymce.EditorManager.execCommand('mceRemoveEditor', true, 'space-desc');
	},

	didReceiveAttrs() {
		this._super(...arguments);

		let constants = this.get('constants');
		let folder = this.get('space');

		let spaceTypeOptions = A([]);
		spaceTypeOptions.pushObject({id: constants.SpaceType.Private, label: this.i18n.localize('personal_explain')});
		spaceTypeOptions.pushObject({id: constants.SpaceType.Protected, label: this.i18n.localize('protected_explain')});
		spaceTypeOptions.pushObject({id: constants.SpaceType.Public, label: this.i18n.localize('public_explain')});
		this.set('spaceTypeOptions', spaceTypeOptions);
		this.set('spaceType', spaceTypeOptions.findBy('id', folder.get('spaceType')));

		this.set('allowLikes', folder.get('allowLikes'));

		if (this.get('allowLikes')) {
			this.set('likes', folder.get('likes'));
		} else {
			this.set('likes', this.i18n.localize('likes_prompt'));
		}

		this.set('spaceName', this.get('space.name'));
		this.set('spaceDesc', this.get('space.desc'));
		this.set('spaceLabel', this.get('space.labelId'));

		let icon = this.get('space.icon');
		if (_.isEmpty(icon)) {
			icon = constants.IconMeta.Apps;
		}

		this.set('spaceIcon', icon);
	},

	actions: {
		onSetSpaceType(t) {
			this.set('spaceType', t);
		},

		onSetSpaceLifecycle(l) {
			this.set('spaceLifecycle', l);
		},

		onSetIcon(icon) {
			this.set('spaceIcon', icon);
		},

		onSetLabel(id) {
			this.set('spaceLabel', id);
		},

		onSave() {
			if (!this.get('isSpaceAdmin')) return;

			let space = this.get('space');
			space.set('spaceType', this.get('spaceType.id'));

			let allowLikes = this.get('allowLikes');
			space.set('likes', allowLikes ? this.get('likes') : '');

			let spaceName = this.get('spaceName').trim();
			if (spaceName.length === 0) return;
			space.set('name', spaceName);

			let editor = tinymce.EditorManager.get('space-desc');
			let spaceDesc = editor.getContent();

			space.set('icon', this.get('spaceIcon'));
			space.set('desc', spaceDesc);
			space.set('labelId', this.get('spaceLabel'));

			this.get('spaceSvc').save(space).then(() => {
				this.notifySuccess(this.i18n.localize('saved'));
			});
		}
	}
});
