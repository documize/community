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
import NotifierMixin from '../../../mixins/notifier';
import TooltipMixin from '../../../mixins/tooltip';
import SectionMixin from '../../../mixins/section';

export default Ember.Component.extend(SectionMixin, NotifierMixin, TooltipMixin, {
    sectionService: Ember.inject.service('section'),
    isDirty: false,
    waiting: false,
    authenticated: false,
    config: {},
	items: {},

    didReceiveAttrs() {
        let config = {};

        try {
            config = JSON.parse(this.get('meta.config'));
        } catch (e) {}

        if (is.empty(config)) {
            config = {
                APIToken: "",
                query: "",
				max: 10,
            };
        }

        this.set('config', config);

        if (this.get('config.APIToken').length > 0) {
            this.send('auth');
        }
    },

    willDestroyElement() {
        this.destroyTooltips();
    },

    actions: {
        isDirty() {
            return this.get('isDirty');
        },

        auth() {
			// missing data?
            this.set('config.APIToken', this.get('config.APIToken').trim());

            if (is.empty(this.get('config.APIToken'))) {
                $("#papertrail-apitoken").addClass("error").focus();
                return;
            }

            let page = this.get('page');
            let self = this;

            this.set('waiting', true);

            this.get('sectionService').fetch(page, "auth", this.get('config'))
            .then(function(response) {
                self.set('authenticated', true);
                self.set('items', response);
                self.set('waiting', false);
            }, function(reason) { //jshint ignore: line
                self.set('authenticated', false);
                self.set('waiting', false);

                switch (reason.status) {
                    case 400:
                        self.showNotification(`Unable to connect to Papertrail`);
                        break;
                    case 403:
                        self.showNotification(`Unable to authenticate`);
                        break;
                    default:
                        self.showNotification(`Something went wrong, try again!`);
                }
            });
        },

        onCancel() {
            this.attrs.onCancel();
        },

        onAction(title) {
			let self = this;
            let page = this.get('page');
            let meta = this.get('meta');
            page.set('title', title);
            meta.set('externalSource', true);

			let config = this.get('config');
			let max = 10;
			if (is.number(parseInt(config.max))) {
				max = parseInt(config.max);
			}

			Ember.set(config, 'max', max);
			this.set('waiting', true);

            this.get('sectionService').fetch(page, "auth", this.get('config'))
            .then(function(response) {
				self.set('items', response);
				let items = self.get('items');

				if (items.events.length > max) {
					items.events = items.events.slice(0, max);
				}

				meta.set('config', JSON.stringify(config));
				meta.set('rawBody', JSON.stringify(items));

				self.set('waiting', false);
	            self.attrs.onAction(page, meta);
            }, function(reason) { //jshint ignore: line
                self.set('authenticated', false);
                self.set('waiting', false);
				console.log(reason);
				self.showNotification(`Something went wrong, try again!`);
            });
        }
    }
});
