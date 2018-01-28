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
    application.inject('route', 'constants', 'constants:main');
    application.inject('controller', 'constants', 'constants:main');
    application.inject('component', 'constants', 'constants:main');
    application.inject('template', 'constants', 'constants:main');
    application.inject('service', 'constants', 'constants:main');
    application.inject('model', 'constants', 'constants:main');
}

export default {
    name: 'constants',
    after: "application",
    initialize: initialize
};