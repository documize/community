// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

$.fn.inView = function(){
    var win = $(window);
    var obj = $(this);

    // trap for no object
    if (obj.length === 0) {
        return false;
    }

    var scrollPosition = win.scrollTop();

    var visibleArea = win.scrollTop() + win.height();

    var objPos = obj.offset().top;// + obj.outerHeight();
    
	return(visibleArea >= objPos && scrollPosition <= objPos ? true : false);
};
