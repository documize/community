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

function getState(toc, page) {
	let state = {
		tocTools: {
			upTarget: "",
			downTarget: "",
			indentIncrement: 0,
			allowIndent: false,
			allowOutdent: false
		},
		actionablePage: false,
		upDisabled: true,
		downDisabled: true,
		indentDisabled: true,
		outdentDisabled: true,
	};

	if (is.undefined(page)) {
		return state;
	}

	var index = _.indexOf(toc, page, false);

	if (index === -1) {
		return state;
	}

	var upPage = toc[index - 1];
	var downPage = toc[index + 1];

	if (_.isUndefined(upPage)) {
		state.tocTools.upTarget = '';
	}

	if (_.isUndefined(downPage)) {
		state.tocTools.downTarget = '';
	}

	// can we go up?
	// can we indent?
	if (!_.isUndefined(upPage)) {
		// can only go up if someone is same or higher level?
		var index2 = _.indexOf(toc, upPage, false);

		if (index2 !== -1) {
			// up
			for (var i = index2; i >= 0; i--) {
				if (page.get('level') > toc[i].get('level')) {
					break;
				}

				if (page.get('level') === toc[i].get('level')) {
					state.tocTools.upTarget = toc[i].id;
					break;
				}
			}

			// indent?
			state.tocTools.allowIndent = upPage.get('level') >= page.get('level');
			state.tocTools.indentIncrement = upPage.get('level') - page.get('level');

			if (state.tocTools.indentIncrement === 0) {
				state.tocTools.indentIncrement = 1;
			}

			// for (var i2 = index2; i2 >= 0; i2--) {
			// 	if (page.level < toc[i2].level) {
			// 		state.tocTools.allowIndent = false;
			// 		break;
			// 	}
			//
			// 	if (page.level === toc[i2].level) {
			// 		state.tocTools.allowIndent = true;
			// 		break;
			// 	}
			// }
		}
	}

	// can we go down?
	if (!_.isUndefined(downPage)) {
		// can only go down if someone below is at our level or higher
		var index3 = _.indexOf(toc, downPage, false);

		if (index3 !== -1) {
			for (var i3 = index3; i3 < toc.length; i3++) {
				if (toc[i3].get('level') < page.get('level')) {
					break;
				}

				if (page.get('level') === toc[i3].get('level')) {
					state.tocTools.downTarget = toc[i3].id;
					break;
				}
			}
		}

		if (page.get('level') > downPage.get('level')) {
			state.tocTools.downTarget = '';
		}
	}

	// can we outdent?
	state.tocTools.allowOutdent = page.get('level') > 1;

	state.upDisabled = state.tocTools.upTarget === '';
	state.downDisabled = state.tocTools.downTarget === '';
	state.indentDisabled = !state.tocTools.allowIndent;
	state.outdentDisabled = !state.tocTools.allowOutdent;

	state.actionablePage = is.not.empty(state.tocTools.upTarget) ||
		is.not.empty(state.tocTools.downTarget) ||
		state.tocTools.allowIndent || state.tocTools.allowOutdent;

	return state;
}

// move up page and any associated kids
function moveUp(state, pages, current) {
	var page1 = _.findWhere(pages, { id: state.tocTools.upTarget });
	var page2 = null;
	var pendingChanges = [];

	if (is.undefined(current) || is.undefined(page1)) {
		return pendingChanges;
	}

	var index1 = _.indexOf(pages, page1, false);

	if (index1 !== -1) {
		page2 = pages[index1 - 1];
	}

	var sequence1 = page1.get('sequence');
	var sequence2 = is.not.null(page2) && is.not.undefined(page2) ? page2.get('sequence') : 0;
	var index = _.indexOf(pages, current, false);

	if (index !== -1) {
		var sequence = (sequence1 + sequence2) / 2;

		pendingChanges.push({
			pageId: current.id,
			sequence: sequence
		});

		for (var i = index + 1; i < pages.length; i++) {
			if (pages[i].get('level') <= current.get('level')) {
				break;
			}

			sequence = (sequence + page1.get('sequence')) / 2;

			pendingChanges.push({
				pageId: pages[i].id,
				sequence: sequence
			});
		}
	}

	return pendingChanges;
}

// move down page and any associated kids
function moveDown(state, pages, current) {
	var pageIndex = _.indexOf(pages, current, false);
	var downTarget = _.findWhere(pages, { id: state.tocTools.downTarget });
	var downTargetIndex = _.indexOf(pages, downTarget, false);
	var pendingChanges = [];

	if (pageIndex === -1 || downTargetIndex === -1) {
		return pendingChanges;
	}

	var startingSequence = 0;
	var upperSequence = 0;
	var cutOff = _.rest(pages, downTargetIndex);
	var siblings = _.reject(cutOff, function (p) {
		return p.get('level') !== current.get('level') || p.id === current.id || p.id === downTarget.id;
	});

	if (siblings.length > 0) {
		var aboveThisGuy = siblings[0];
		var belowThisGuy = pages[_.indexOf(pages, aboveThisGuy, false) - 1];

		if (is.not.null(belowThisGuy) && belowThisGuy.get('level') > current.get('level')) {
			startingSequence = (aboveThisGuy.get('sequence') + belowThisGuy.get('sequence')) / 2;
			upperSequence = aboveThisGuy.get('sequence');
		} else {
			var otherGuy = pages[downTargetIndex + 1];

			startingSequence = (otherGuy.get('sequence') + downTarget.get('sequence')) / 2;
			upperSequence = otherGuy.get('sequence');
		}
	} else {
		// startingSequence = downTarget.sequence * 2;
		startingSequence = cutOff[cutOff.length - 1].sequence * 2;
		upperSequence = startingSequence * 2;
	}

	pendingChanges.push({
		pageId: current.id,
		sequence: startingSequence
	});

	var sequence = (startingSequence + upperSequence) / 2;

	for (var i = pageIndex + 1; i < pages.length; i++) {
		if (pages[i].get('level') <= current.get('level')) {
			break;
		}

		var sequence2 = (sequence + upperSequence) / 2;

		pendingChanges.push({
			pageId: pages[i].id,
			sequence: sequence2
		});
	}

	return pendingChanges;
}

// indent page and any associated kisds
function indent(state, pages, current) {
	var pageIndex = _.indexOf(pages, current, false);
	var pendingChanges = [];

	pendingChanges.push({
		pageId: current.id,
		level: current.get('level') + state.tocTools.indentIncrement
	});

	for (var i = pageIndex + 1; i < pages.length; i++) {
		if (pages[i].get('level') <= current.get('level')) {
			break;
		}

		pendingChanges.push({
			pageId: pages[i].id,
			level: pages[i].get('level') + state.tocTools.indentIncrement
		});
	}

	return pendingChanges;
}

function outdent(state, pages, current) {
	var pageIndex = _.indexOf(pages, current, false);
	var pendingChanges = [];

	pendingChanges.push({
		pageId: current.id,
		level: current.get('level') - 1
	});

	for (var i = pageIndex + 1; i < pages.length; i++) {
		if (pages[i].get('level') <= current.get('level')) {
			break;
		}

		pendingChanges.push({
			pageId: pages[i].id,
			level: pages[i].get('level') - 1
		});
	}

	return pendingChanges;
}

export default {
	getState,
	moveUp,
	moveDown,
	indent,
	outdent
};
