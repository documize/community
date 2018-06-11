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
import { computed } from '@ember/object';
import stringUtil from '../../utils/string';
import AuthMixin from '../../mixins/auth';
import Notifier from '../../mixins/notifier';
import Component from '@ember/component';

export default Component.extend(AuthMixin, Notifier, {
	spaceSvc: service('folder'),

	isSpaceAdmin: computed('permissions', function() {
		return this.get('permissions.spaceOwner') || this.get('permissions.spaceManage');
	}),

	actions: {
		onOpenTemplate(id) {
			if (is.empty(id)) {
				return;
			}
			let template = this.get('templates').findBy('id', id)

			let slug = stringUtil.makeSlug(template.get('title'));
			this.get('router').transitionTo('document', this.get('space.id'), this.get('space.slug'), id, slug);
		}
	}
});
