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

import Mixin from '@ember/object/mixin';

export default Mixin.create({
	// isReadonly() {
	// 	if (this.get('page.userId') === this.get('session.session.authenticated.user.id')) {
	// 		return undefined;
	// 	} else {
	// 		return "readonly";
	// 	}
	// }.property('page'),

	// isMine() {
	// 	return this.get('page.userId') === this.get('session.session.authenticated.user.id');
	// }.property('page')
});