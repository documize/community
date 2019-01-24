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

import Evented from '@ember/object/evented';
import Service from '@ember/service';

export default Service.extend(Evented, {
	// init() {
	// 	this._super(...arguments);
	// 	let _this = this;

	// 	window.addEventListener("scroll", _.throttle(function() {
	// 		_this.publish('scrolled', null);
	// 	}, 100));

	// 	window.addEventListener("resize", _.debounce(function() {
	// 		_this.publish('resized', null);
	// 	}, 100));
	// },

    publish: function() {
        return this.trigger.apply(this, arguments);
    },

    subscribe: function() {
        return this.on.apply(this, arguments);
    },

    unsubscribe: function() {
        return this.off.apply(this, arguments);
    }
});
