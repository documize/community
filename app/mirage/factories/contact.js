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

/*
  This is an example factory definition.

  Create more files in this directory to define additional factories.
*/
import Mirage /*, {faker} */ from 'ember-cli-mirage';

export default Mirage.Factory.extend({
	// name: 'Pete',                         // strings
	// age: 20,                              // numbers
	// tall: true,                           // booleans

	// email: function(i) {                  // and functions
	//   return 'person' + i + '@test.com';
	// },

	// firstName: faker.name.firstName,       // using faker
	// lastName: faker.name.firstName,
	// zipCode: faker.address.zipCode
});
