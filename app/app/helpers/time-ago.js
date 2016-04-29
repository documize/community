import Ember from 'ember';
import dateUtil from '../utils/date';

// {{time-ago createdAt}}
export function timeAgo(params) {
    return dateUtil.timeAgo(params[0]);
}

export default Ember.Helper.helper(timeAgo);
