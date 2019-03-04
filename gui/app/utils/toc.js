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
		pageId: ''
	};

	if (_.isUndefined(page)) {
		return state;
	}

	state.pageId = page.get('id');

	var index = _.findIndex(toc, function(i) { return i.get('page.id') === page.get('id'); });

	if (index === -1) {
		return state;
	}

	var upPage = _.isUndefined(toc[index - 1]) ? toc[index - 1] : toc[index - 1].get('page');
	var downPage = _.isUndefined(toc[index + 1]) ? toc[index + 1] : toc[index + 1].get('page');

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
		var index2 = _.findIndex(toc, function(i) { return i.get('page.id') === upPage.get('id'); });

		if (index2 !== -1) {
			// up
			for (var i = index2; i >= 0; i--) {
				if (page.get('level') > toc[i].get('page.level')) {
					break;
				}

				if (page.get('level') === toc[i].get('page.level')) {
					state.tocTools.upTarget = toc[i].get('page.id');
					break;
				}
			}

			// indent?
			state.tocTools.allowIndent = upPage.get('level') >= page.get('level');
			state.tocTools.indentIncrement = upPage.get('level') - page.get('level');

			if (state.tocTools.indentIncrement === 0) {
				state.tocTools.indentIncrement = 1;
			}
		}
	}

	// can we go down?
	if (!_.isUndefined(downPage)) {
		// can only go down if someone below is at our level or higher
		var index3 = _.findIndex(toc, function(i) { return i.get('page.id') === downPage.get('id'); });

		if (index3 !== -1) {
			for (var i3 = index3; i3 < toc.length; i3++) {
				if (toc[i3].get('page.level') < page.get('level')) {
					break;
				}

				if (page.get('level') === toc[i3].get('page.level')) {
					state.tocTools.downTarget = toc[i3].get('page.id');
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

	state.actionablePage = !_.isEmpty(state.tocTools.upTarget) ||
		!_.isEmpty(state.tocTools.downTarget) ||
		state.tocTools.allowIndent || state.tocTools.allowOutdent;

	return state;
}

// move up page and any associated kids
function moveUp(state, pages, current) {
	var page1 = _.find(pages, function(i) { return i.get('page.id') === state.tocTools.upTarget });
	var page2 = null;
	var pendingChanges = [];

	if (!_.isUndefined(page1)) page1 = page1.get('page');

	if (_.isUndefined(current) || _.isUndefined(page1)) {
		return pendingChanges;
	}

	var index1 = _.findIndex(pages, function(i) { return i.get('page.id') === page1.get('id'); });

	if (index1 !== -1) {
		if (!_.isUndefined(pages[index1 - 1])) page2 = pages[index1 - 1].get('page');
	}

	var sequence1 = page1.get('sequence');
	var sequence2 = !_.isNull(page2) && !_.isUndefined(page2) ? page2.get('sequence') : 0;
	var index = _.findIndex(pages, function(i) { return i.get('page.id') === current.get('id'); });

	if (index !== -1) {
		var sequence = (sequence1 + sequence2) / 2;

		pendingChanges.push({
			pageId: current.get('id'),
			sequence: sequence
		});

		for (var i = index + 1; i < pages.length; i++) {
			if (pages[i].get('page.level') <= current.get('level')) {
				break;
			}

			sequence = (sequence + page1.get('sequence')) / 2;

			pendingChanges.push({
				pageId: pages[i].get('page.id'),
				sequence: sequence
			});
		}
	}

	return pendingChanges;
}

// move down page and any associated kids
function moveDown(state, pages, current) {
	var pageIndex = _.findIndex(pages, function(i) { return i.get('page.id') === current.get('id'); });
	var downTarget = _.find(pages, function(i) { return i.get('page.id') === state.tocTools.downTarget; });
	if (!_.isUndefined(downTarget)) downTarget = downTarget.get('page');

	var downTargetIndex = _.findIndex(pages, function(i) { return i.get('page.id')  === downTarget.get('id'); });
	var pendingChanges = [];

	if (pageIndex === -1 || downTargetIndex === -1) {
		return pendingChanges;
	}

	var startingSequence = 0;
	var upperSequence = 0;
	var cutOff = _.drop(pages, downTargetIndex);
	var siblings = _.reject(cutOff, function (p) {
		return p.get('page.level') !== current.get('level') || p.get('page.id') === current.get('id') || p.get('page.id') === downTarget.get('id');
	});

	if (siblings.length > 0) {
		var aboveThisGuy = siblings[0].get('page');
		var belowThisGuyIndex = _.findIndex(pages, function(i) { return i.get('page.id') === aboveThisGuy.get('id'); })
		var belowThisGuy = pages[belowThisGuyIndex - 1];

		if (!_.isNull(belowThisGuy)) belowThisGuy = belowThisGuy.get('page');

		if (!_.isNull(belowThisGuy) && belowThisGuy.get('level') > current.get('level')) {
			startingSequence = (aboveThisGuy.get('sequence') + belowThisGuy.get('sequence')) / 2;
			upperSequence = aboveThisGuy.get('sequence');
		} else {
			var otherGuy = pages[downTargetIndex + 1].get('page');

			startingSequence = (otherGuy.get('sequence') + downTarget.get('sequence')) / 2;
			upperSequence = otherGuy.get('sequence');
		}
	} else {
		// startingSequence = downTarget.sequence * 2;
		startingSequence = cutOff[cutOff.length - 1].get('page.sequence') * 2;
		upperSequence = startingSequence * 2;
	}

	pendingChanges.push({
		pageId: current.get('id'),
		sequence: startingSequence
	});

	var sequence = (startingSequence + upperSequence) / 2;

	for (var i = pageIndex + 1; i < pages.length; i++) {
		if (pages[i].get('page.level') <= current.get('level')) {
			break;
		}

		var sequence2 = (sequence + upperSequence) / 2;

		pendingChanges.push({
			pageId: pages[i].get('page.id'),
			sequence: sequence2
		});
	}

	return pendingChanges;
}

// indent page and any associated kisds
function indent(state, pages, current) {
	var pageIndex = _.findIndex(pages, function(i) { return i.get('page.id') === current.get('id'); });
	var pendingChanges = [];

	pendingChanges.push({
		pageId: current.get('id'),
		level: current.get('level') + state.tocTools.indentIncrement
	});

	for (var i = pageIndex + 1; i < pages.length; i++) {
		if (pages[i].get('page.level') <= current.get('level')) {
			break;
		}

		pendingChanges.push({
			pageId: pages[i].get('page.id'),
			level: pages[i].get('page.level') + state.tocTools.indentIncrement
		});
	}

	return pendingChanges;
}

function outdent(state, pages, current) {
	var pageIndex = _.findIndex(pages, function(i) { return i.get('page.id') === current.get('id'); });
	var pendingChanges = [];

	pendingChanges.push({
		pageId: current.get('id'),
		level: current.get('level') - 1
	});

	for (var i = pageIndex + 1; i < pages.length; i++) {
		if (pages[i].get('page.level') <= current.get('level')) {
			break;
		}

		pendingChanges.push({
			pageId: pages[i].get('page.id'),
			level: pages[i].get('page.level') - 1
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
