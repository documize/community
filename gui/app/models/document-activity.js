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
import constants from '../utils/constants'; 

export default Model.extend({
	orgId: attr('string'),
	folderId: attr('string'),
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

		switch (this.get('activityType')) {
			case constants.UserActivityType.Created:
				label = 'Added';
				break;
			case constants.UserActivityType.Read:
				label = 'Viewed';
				break;
			case constants.UserActivityType.Edited:
				label = 'Edited';
				break;
			case constants.UserActivityType.Deleted:
				label = 'Deleted';
				break;
			case constants.UserActivityType.Archived:
				label = 'Archived';
				break;
			case constants.UserActivityType.Approved:
				label = 'Approved';
				break;
			case constants.UserActivityType.Reverted:
				label = 'Reverted';
				break;
			case constants.UserActivityType.PublishedTemplate:
				label = 'Published Template';
				break;
			case constants.UserActivityType.PublishedBlock:
				label = 'Published Block';
				break;
			case constants.UserActivityType.Rejected:
				label = 'Rejected';
				break;
			default:
				break;
		}

		return label;
	}),

	activityColor: computed('activityType', function() {
		let color = '';

		switch (this.get('activityType')) {
			case constants.UserActivityType.Created:
				color = 'color-blue';
				break;
			case constants.UserActivityType.Read:
				color = 'color-black';
				break;
			case constants.UserActivityType.Edited:
				color = 'color-green';
				break;
			case constants.UserActivityType.Deleted:
				color = 'color-red';
				break;
			case constants.UserActivityType.Archived:
				color = 'color-gray';
				break;
			case constants.UserActivityType.Approved:
				color = 'color-green';
				break;
			case constants.UserActivityType.Reverted:
				color = 'color-red';
				break;
			case constants.UserActivityType.PublishedTemplate:
				color = 'color-blue';
				break;
			case constants.UserActivityType.PublishedBlock:
				color = 'color-blue';
				break;
			case constants.UserActivityType.Rejected:
				color = 'color-red';
				break;
			default:
				break;
		}

		return color;
	})
});
