import Ember from 'ember';

export default Ember.Helper.helper(function([object, path]) {
    return Ember.get(object, path);
});
