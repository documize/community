import Ember from 'ember';

// Usage: {{is-not selection}}
export default Ember.Helper.helper(function([value]) {
    return !value;
});
