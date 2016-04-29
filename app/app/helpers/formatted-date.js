import Ember from 'ember';
import dateUtil from '../utils/date';

export function formattedDate(params) {
    return dateUtil.toIsoDate(params[0], params[1]);
}

export default Ember.Helper.helper(formattedDate);
