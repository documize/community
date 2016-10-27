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
    application.inject('component', 'router', 'router:main');
	application.inject('service', 'router', 'router:main');
}

export default {
    name: 'route-injector',
    initialize: initialize
};
