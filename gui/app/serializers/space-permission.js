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

import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
	normalize(modelClass, resourceHash) {
		let id = '0';
		if (resourceHash.id) id = resourceHash.id;

		return {
			data: {
				id: id,
				type: modelClass.modelName,
				attributes: resourceHash
			}
		};
	}
});
