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
    let win = $(window);
    let obj = $(this);

    // trap for no object
    if (obj.length === 0) {
        return false;
    }

    // the top Scroll Position in the page
    let scrollPosition = win.scrollTop();

    // the end of the visible area in the page, starting from the scroll position
    let visibleArea = win.scrollTop() + win.height();

    // we check to see if the start of object is in view
    let objPos = obj.offset().top;// + obj.outerHeight();
    
	return(visibleArea >= objPos && scrollPosition <= objPos ? true : false);
};
