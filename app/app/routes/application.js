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

import Ember from 'ember';
import netUtil from '../utils/net';

const {
	inject: { service }
} = Ember;

export default Ember.Route.extend({
    userService: service('user'),
    sessionService: service('session'),
	appMeta: service(),

    transitioning: false,

    beforeModel: function(transition) {
        let self = this;
        let session = this.get('sessionService');

        // Session ready?
        return this.get('appMeta').boot().then(function() {
            // Need to authenticate?
            if (!session.get("appMeta.allowAnonymousAccess") && !session.get("authenticated") &&
                is.not.startWith(transition.targetName, 'auth.')) {
                if (!self.transitioning) {
                    session.set('previousTransition', transition);
                    self.set('transitioning', true);
                }

                transition.abort();
                self.transitionTo('auth.login');
            }
        });
    },

    actions: {
        willTransition: function( /*transition*/ ) {
			$("#zone-sidebar").css('height', 'auto');
            Mousetrap.reset();
        },

		didTransition() {
			Ember.run.schedule("afterRender",this,function() {
				$("#zone-sidebar").css('height', $(document).height() - $("#zone-navigation").height() - $("#zone-header").height() - 35);
		    });

			return true;
		},

        error(error, transition) { // jshint ignore: line
            if (error) {
				if (netUtil.isAjaxAccessError(error)) {
					localStorage.clear();
					return this.transitionTo('auth.login');
				}
            }

            // Return true to bubble this event to any parent route.
            return true;
        }
    },
});
