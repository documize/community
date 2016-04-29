import Ember from 'ember';

export default Ember.Service.extend({
    interval(func, wait, times) {
        var interv = function(w, t){
            return function(){
                if(typeof t === "undefined" || t-- > 0) {
                    setTimeout(interv, w);
                    try {
                        func.call(null);
                    }
                    catch(e) {
                        t = 0;
                        throw e.toString();
                    }
                }
            };
        }(wait, times);

        setTimeout(interv, wait);
    }
});
