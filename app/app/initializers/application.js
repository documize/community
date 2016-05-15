export function initialize( /*application*/ ) {
    // address insecure jquery defaults (kudos: @nathanhammond)
    $.globalEval = function() {};
    $.ajaxSetup({
        crossDomain: true,
        converters: {
            'text script': text => text
        }
    });

    Dropzone.autoDiscover = false;

    // global trap for XHR 401
    $(document).ajaxError(function(e, xhr /*, settings, exception*/ ) {
        if (xhr.status === 401 && is.not.startWith(window.location.pathname, "/auth/")) {
            window.location.href = "/auth/login";
        }
    });
}

export default {
    name: 'application',
    initialize: initialize
};