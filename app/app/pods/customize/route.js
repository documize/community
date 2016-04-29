/*global is*/
import Ember from 'ember';

export default Ember.Route.extend(
{
    beforeModel: function(transition)
    {
        if (is.equal(transition.targetName, 'customize.index')) {
            this.transitionTo('customize.general');
        }
    },
});
