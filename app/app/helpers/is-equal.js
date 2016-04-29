import Ember from 'ember';

// Usage: {{is-equal item selection}}
export default Ember.Helper.helper(function([leftSide, rightSide]) {
    return leftSide === rightSide;
});
