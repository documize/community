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

import { computed } from '@ember/object';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
	orgId: attr('string'),
	spaceId: attr('string'),
	documentId: attr('string'),
	pageId: attr('string'),
	pageTitle: attr('string'),
	userId: attr('string'),
	firstname: attr('string'),
	lastname: attr('string'),
	activityType: attr('number'),
	created: attr(),

	activityLabel: computed('activityType', function() {
		let label = '';
		let constants = this.get('constants');

		switch (this.get('activityType')) {
			case constants.UserActivityType.Created:
				label = this.i18n.localize('added');
				break;
			case constants.UserActivityType.Read:
				label = this.i18n.localize('viewed');
				break;
			case constants.UserActivityType.Edited:
				label = this.i18n.localize('edited');
				break;
			case constants.UserActivityType.Deleted:
				label = this.i18n.localize('deleted');
				break;
			case constants.UserActivityType.Archived:
				label = this.i18n.localize('archived');
				break;
			case constants.UserActivityType.Approved:
				label = this.i18n.localize('approved');
				break;
			case constants.UserActivityType.Reverted:
				label = this.i18n.localize('reverted');
				break;
			case constants.UserActivityType.PublishedTemplate:
				label = this.i18n.localize('template_published');
				break;
			case constants.UserActivityType.PublishedBlock:
				label = this.i18n.localize('block_published');
				break;
			case constants.UserActivityType.Rejected:
				label = this.i18n.localize('rejected');
				break;
			case constants.UserActivityType.Published:
				label = this.i18n.localize('published');
				break;
			default:
				break;
		}

		return label;
	}),

	activityColor: computed('activityType', function() {
		let color = '';
		let constants = this.get('constants');

		switch (this.get('activityType')) {
			case constants.UserActivityType.Created:
				color = 'color-gray-700';
				break;
			case constants.UserActivityType.Read:
				color = 'color-black';
				break;
			case constants.UserActivityType.Edited:
				color = 'color-green-700';
				break;
			case constants.UserActivityType.Deleted:
				color = 'color-red-600';
				break;
			case constants.UserActivityType.Archived:
				color = 'color-gray-700';
				break;
			case constants.UserActivityType.Approved:
				color = 'color-green-700';
				break;
			case constants.UserActivityType.Reverted:
				color = 'color-red-600';
				break;
			case constants.UserActivityType.PublishedTemplate:
				color = 'color-gray-700';
				break;
			case constants.UserActivityType.PublishedBlock:
				color = 'color-gray-700';
				break;
			case constants.UserActivityType.Rejected:
				color = 'color-red-600';
				break;
			case constants.UserActivityType.Published:
				color = 'color-green-700';
				break;
			default:
				break;
		}

		return color;
	})
});
