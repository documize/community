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
import { empty, and } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import { set } from '@ember/object';
import { inject as service } from '@ember/service';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(Notifier, {
	appMeta: service(),
	router: service(),
	maxTags: 3,
	domain: '',
	titleEmpty: empty('model.general.title'),
	messageEmpty: empty('model.general.message'),
	conversionEndpointEmpty: empty('model.general.conversionEndpoint'),
	hasTitleInputError: and('titleEmpty', 'titleError'),
	hasMessageInputError: and('messageEmpty', 'messageError'),
	hasConversionEndpointInputError: and('conversionEndpointEmpty', 'conversionEndpointError'),

	didReceiveAttrs() {
		this._super(...arguments);
		this.set('maxTags', this.get('model.general.maxTags'));
		this.set('domain', this.get('model.general.domain'));
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
						self.notifySuccess('Logo uploaded');
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
	},

	actions: {
		change() {
            const selectEl = this.$('#maxTags')[0];
            const selection = selectEl.selectedOptions[0].value;

			this.set('maxTags', parseInt(selection));
        },

		save() {
			if (isEmpty(this.get('model.general.title'))) {
				set(this, 'titleError', true);
				return $("#siteTitle").focus();
			}

			if (isEmpty(this.get('model.general.message'))) {
				set(this, 'messageError', true);
				return $("#siteMessage").focus();
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

			let domainChanged = this.get('model.general.domain') !== this.get('domain').toLowerCase();
			this.set('model.general.domain', this.get('domain').toLowerCase());

			this.get('onUpdate')().then(() => {
				this.notifySuccess('Saved');
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
			this.notifySuccess('Using default logo');
		}
	}
});
