import Ember from 'ember';

// {{user-initials firstname lastname}}
export function userInitials(params) {
    let firstname = params[0];
    let lastname = params[1];

    return  (firstname.substring(0, 1) + lastname.substring(0, 1)).toUpperCase();
}

export default Ember.Helper.helper(userInitials);
