import Ember from 'ember';

function isVisible(selector) {
  return $(selector).length > 0;
}

function checkVisibility(selector, interval, resolve, visibility) {
  if (isVisible(selector) === visibility) {
    resolve($(selector));
  } else {
      console.log('waiting for visibility');
    Ember.run.later(null, function() {
      checkVisibility(selector, interval, resolve, visibility);
    }, interval);
  }
}

export default Ember.Test.registerAsyncHelper('waitToAppear', function(app, selector, interval = 200) {
    return new Ember.RSVP.Promise(function(resolve) {
      checkVisibility(selector, interval, resolve, true);
    });
});
