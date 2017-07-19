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

// from http://thecodeship.com/web-development/alternative-to-javascript-evil-setinterval/
function interval(func, wait, times) {
	var interv = function (w, t) {
		return function () {
			if (typeof t === "undefined" || t-- > 0) {
				setTimeout(interv, w);
				try {
					func.call(null);
				} catch (e) {
					t = 0;
					throw e.toString();
				}
			}
		};
	}(wait, times);

	setTimeout(interv, wait);
}

// Function wrapping code.
// fn - reference to function.
// context - what you want "this" to be.
// params - array of parameters to pass to function.
// e.g. var fun1 = wrapFunction(sayStuff, this, ["Hello, world!"]);
// http://stackoverflow.com/questions/899102/how-do-i-store-javascript-functions-in-a-queue-for-them-to-be-executed-eventuall
function wrapFunction(fn, context, params) {
	return function () {
		fn.apply(context, params);
	};
}

function insertAtCursor(myField, myValue) {
	//IE support
	if (document.selection) {
		myField.focus();
		let sel = document.selection.createRange();
		sel.text = myValue;
	}
	//MOZILLA and others
	else if (myField.selectionStart || myField.selectionStart === '0') {
		var startPos = myField.selectionStart;
		var endPos = myField.selectionEnd;
		myField.value = myField.value.substring(0, startPos) +
			myValue +
			myField.value.substring(endPos, myField.value.length);
		myField.selectionStart = startPos + myValue.length;
		myField.selectionEnd = startPos + myValue.length;
	} else {
		myField.value += myValue;
	}
}

export default {
	interval,
	wrapFunction,
	insertAtCursor
};
