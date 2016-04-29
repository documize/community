import Ember from 'ember';

// Usage: {{generate-id 'admin-' 123}}
export default Ember.Helper.helper(function(params) {
    let prefix = params[0];
    let id = params[1];
    return prefix + "-" + id;
});
