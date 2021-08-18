/* eslint-disable ember/require-super-in-init */

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
import constants from '../constants/constants';

export function initialize(application) {
    $.globalEval = function() {};
    $.ajaxSetup({
        crossDomain: true,
        converters: {
            'text script': text => text
        }
    });

    let cs = constants.constants;
    application.register('constants:main', cs);

    Dropzone.autoDiscover = false;
}

export default {
    name: 'application',
    initialize: initialize
};
