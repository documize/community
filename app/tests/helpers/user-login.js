import Ember from 'ember';

export default Ember.Test.registerAsyncHelper('userLogin', function() {
    visit('/auth/login');

    fillIn('#authEmail', 'brizdigital@gmail.com');
    fillIn('#authPassword', 'zinyando123');
    click('button');
});
