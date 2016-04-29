import Ember from 'ember';
import {
    module,
    test
} from 'qunit';
import startApp from 'ember-testing/tests/helpers/start-app';
import moduleForAcceptance from 'documize/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | login');

var application;

module('Acceptance | login', {
    beforeEach: function() {
        application = startApp();
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('user');
        window.localStorage.removeItem('folder');
    },

    afterEach: function() {
        Ember.run(application, 'destroy');
    }
});


test('visiting /auth/login', function(assert) {
    visit('/auth/login');
    // fillIn('#authEmail', 'harvey@kandola.com');
    // fillIn('#authPassword', 'demo123');
    // click('button');
    andThen(function() {
        assert.equal(currentURL(), '/auth/login');
    });
});