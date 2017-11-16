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

import { registerAsyncHelper } from '@ember/test';

export default registerAsyncHelper('userLogin', function () {
	visit('/auth/login');

	fillIn('#authEmail', 'brizdigital@gmail.com');
	fillIn('#authPassword', 'zinyando123');
	click('button');
});