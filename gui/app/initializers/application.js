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
import econstants from '../constants/econstants';

export function initialize(application) {
    // address insecure jquery defaults (kudos: @nathanhammond)
    $.globalEval = function() {};
    $.ajaxSetup({
        crossDomain: true,
        converters: {
            'text script': text => text
        }
    });

    let cs = constants.constants;
    let ec = econstants.econstants;
    application.register('constants:main', cs);
    application.register('econstants:main', ec);

    Dropzone.autoDiscover = false;
    CodeMirror.modeURL = "/codemirror/mode/%N/%N.js";
}

export default {
    name: 'application',
    initialize: initialize
};
