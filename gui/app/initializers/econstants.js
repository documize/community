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

export function initialize(application) {
	application.inject('route', 'econstants', 'econstants:main');
	application.inject('controller', 'econstants', 'econstants:main');
	application.inject('component', 'econstants', 'econstants:main');
	application.inject('template', 'econstants', 'econstants:main');
	application.inject('service', 'econstants', 'econstants:main');
	application.inject('model', 'econstants', 'econstants:main');
}

export default {
	name: 'econstants',
	after: "application",
	initialize: initialize
};
