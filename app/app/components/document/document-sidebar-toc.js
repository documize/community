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

import Ember from 'ember';
import NotifierMixin from '../../mixins/notifier';
import TooltipMixin from '../../mixins/tooltip';

export default Ember.Component.extend(NotifierMixin, TooltipMixin, {
    document: {},
    folder: {},
    pages: [],
    page: "",
    showToc: false,
    tocTools: {
        UpTarget: "",
        DownTarget: "",
        AllowIndent: false,
        AllowOutdent: false
    },
    actionablePage: false,
    upDisabled: true,
    downDisabled: true,
    indentDisabled: true,
    outdentDisabled: true,

    didReceiveAttrs: function() {
        this.set('showToc', is.not.undefined(this.get('pages')) && this.get('pages').get('length') > 2);
        if (is.not.null(this.get('page'))) {
            this.send('onEntryClick', this.get('page'));
        }
    },

    didRender: function() {
        if (this.session.authenticated) {
            this.addTooltip(document.getElementById("toc-up-button"));
            this.addTooltip(document.getElementById("toc-down-button"));
            this.addTooltip(document.getElementById("toc-outdent-button"));
            this.addTooltip(document.getElementById("toc-indent-button"));
        }
    },

    didInsertElement() {
        this.eventBus.subscribe('documentPageAdded', this, 'onDocumentPageAdded');

        var s = $(".document-structure");
        var pos = s.position();

        $(window).scroll(function() {
            var windowpos = $(window).scrollTop();
            if (windowpos - 200 >= pos.top) {
                s.addClass("stick");
                s.css('width', s.parent().width());
            } else {
                s.removeClass("stick");
                s.css('width', 'auto');
            }
        });
    },

    willDestroyElement() {
        this.eventBus.unsubscribe('documentPageAdded');
		this.destroyTooltips();
    },

    onDocumentPageAdded(pageId) {
        this.send('onEntryClick', pageId);
    },

    // Controls what user can do with the toc (left sidebar).
    // Identifies the target pages.
    setState(pageId) {
        // defaults
        this.set('tocTools.UpTarget', "");
        this.set('tocTools.DownTarget', "");
        this.set('tocTools.AllowIndent', false);
        this.set('tocTools.AllowOutdent', false);
        this.set('actionablePage', false);
        this.set('upDisabled', true);
        this.set('downDisabled', true);
        this.set('indentDisabled', true);
        this.set('outdentDisabled', true);

        if (!this.get('isEditor') || is.empty(pageId)) {
            return;
        }

        this.set('page', pageId);

        var toc = this.get('pages');
        var page = _.findWhere(toc, {
            id: pageId
        });

        // handle root node
        if (is.undefined(page) || page.level === 1) {
            return;
        }

        var index = _.indexOf(toc, page, false);

        if (index === -1) {
            return;
        }

        var upPage = toc[index - 1];
        var downPage = toc[index + 1];

        if (_.isUndefined(upPage)) {
            this.set('tocTools.UpTarget', "");
        }

        if (_.isUndefined(downPage)) {
            this.set('tocTools.DownTarget', "");
        }

        // can we go up?
        // can we indent?
        if (!_.isUndefined(upPage)) {
            // can only go up if someone is same or higher level?
            var index2 = _.indexOf(toc, upPage, false);

            if (index2 !== -1) {
                // up
                for (var i = index2; i > 0; i--) {
                    if (page.level > toc[i].level) {
                        break;
                    }

                    if (page.level === toc[i].level) {
                        this.set('tocTools.UpTarget', toc[i].id);
                        break;
                    }
                }

                // indent?
                for (var i2 = index2; i2 > 0; i2--) {
                    if (toc[i2].level < page.level) {
                        this.set('tocTools.AllowIndent', false);
                        break;
                    }

                    if (page.level === toc[i2].level) {
                        this.set('tocTools.AllowIndent', true);
                        break;
                    }
                }
            }

            // if page above is root node then some things you can't do
            if (upPage.level === 1) {
                this.set('tocTools.AllowIndent', false);
                this.set('tocTools.UpTarget', "");
            }
        }

        // can we go down?
        if (!_.isUndefined(downPage)) {
            // can only go down if someone below is at our level or higher
            var index3 = _.indexOf(toc, downPage, false);

            if (index3 !== -1) {
                for (var i3 = index3; i3 < toc.length; i3++) {
                    if (toc[i3].level < page.level) {
                        break;
                    }

                    if (page.level === toc[i3].level) {
                        this.set('tocTools.DownTarget', toc[i3].id);
                        break;
                    }
                }
            }

            if (page.level > downPage.level) {
                this.set('tocTools.DownTarget', "");
            }
        }

        // can we outdent?
        this.set('tocTools.AllowOutdent', page.level > 2);

        this.set('upDisabled', this.get('tocTools.UpTarget') === "");
        this.set('downDisabled', this.get('tocTools.DownTarget') === "");
        this.set('indentDisabled', !this.get('tocTools.AllowIndent'));
        this.set('outdentDisabled', !this.get('tocTools.AllowOutdent'));

        this.set('actionablePage',
            is.not.empty(this.get('tocTools.UpTarget')) ||
            is.not.empty(this.get('tocTools.DownTarget')) ||
            this.get('tocTools.AllowIndent') ||
            this.get('tocTools.AllowOutdent'));
    },

    actions: {
        // Page up - above pages shunt down.
        pageUp() {
            if (this.upDisabled) {
                return;
            }

            var pages = this.get('pages');
            var current = _.findWhere(pages, {
                id: this.get('page')
            });
            var page1 = _.findWhere(pages, {
                id: this.tocTools.UpTarget
            });
            var page2 = null;
            var pendingChanges = [];

            if (is.undefined(current) || is.undefined(page1)) {
                return;
            }

            var index1 = _.indexOf(pages, page1, false);

            if (index1 !== -1 && index1 > 1) {
                page2 = pages[index1 - 1];
            }

            var sequence1 = page1.sequence;
            var sequence2 = is.not.null(page2) ? page2.sequence : 1024;

            var index = _.indexOf(pages, current, false);

            if (index !== -1) {
                var sequence = (sequence1 + sequence2) / 2;

                pendingChanges.push({
                    pageId: current.id,
                    sequence: sequence
                });

                for (var i = index + 1; i < pages.length; i++) {
                    if (pages[i].level <= current.level) {
                        break;
                    }

                    sequence = (sequence + page1.sequence) / 2;

                    pendingChanges.push({
                        pageId: pages[i].id,
                        sequence: sequence
                    });
                }
            }

            this.attrs.changePageSequence(pendingChanges);

            this.send('onEntryClick', this.get('page'));
            this.audit.record("moved-page-up");
            this.showNotification("Moved up");
        },

        // Move down -- pages below shift up.
        pageDown() {
            if (this.downDisabled) {
                return;
            }

            var pages = this.get('pages');
            var current = _.findWhere(pages, {
                id: this.get('page')
            });
            var pageIndex = _.indexOf(pages, current, false);
            var downTarget = _.findWhere(pages, {
                id: this.tocTools.DownTarget
            });
            var downTargetIndex = _.indexOf(pages, downTarget, false);
            var pendingChanges = [];

            if (pageIndex === -1 || downTargetIndex === -1) {
                return;
            }

            var startingSequence = 0;
            var upperSequence = 0;
            var cutOff = _.rest(pages, downTargetIndex);
            var siblings = _.reject(cutOff, function(p) {
                return p.level !== current.level || p.id === current.id || p.id === downTarget.id;
            });

            if (siblings.length > 0) {
                var aboveThisGuy = siblings[0];
                var belowThisGuy = pages[_.indexOf(pages, aboveThisGuy, false) - 1];

                if (is.not.null(belowThisGuy) && belowThisGuy.level > current.level) {
                    startingSequence = (aboveThisGuy.sequence + belowThisGuy.sequence) / 2;
                    upperSequence = aboveThisGuy.sequence;
                } else {
                    var otherGuy = pages[downTargetIndex + 1];

                    startingSequence = (otherGuy.sequence + downTarget.sequence) / 2;
                    upperSequence = otherGuy.sequence;
                }
            } else {
                startingSequence = downTarget.sequence * 2;
                upperSequence = startingSequence * 2;
            }

            pendingChanges.push({
                pageId: current.id,
                sequence: startingSequence
            });

            var sequence = (startingSequence + upperSequence) / 2;

            for (var i = pageIndex + 1; i < pages.length; i++) {
                if (pages[i].level <= current.level) {
                    break;
                }

                var sequence2 = (sequence + upperSequence) / 2;

                pendingChanges.push({
                    pageId: pages[i].id,
                    sequence: sequence2
                });
            }

            this.attrs.changePageSequence(pendingChanges);

            this.send('onEntryClick', this.get('page'));
            this.audit.record("moved-page-down");
            this.showNotification("Moved down");
        },

        // Indent - changes a page from H2 to H3, etc.
        pageIndent() {
            if (this.indentDisabled) {
                return;
            }

            var pages = this.get('pages');
            var current = _.findWhere(pages, {
                id: this.get('page')
            });
            var pageIndex = _.indexOf(pages, current, false);
            var pendingChanges = [];

            pendingChanges.push({
                pageId: current.id,
                level: current.level + 1
            });

            for (var i = pageIndex + 1; i < pages.length; i++) {
                if (pages[i].level <= current.level) {
                    break;
                }

                pendingChanges.push({
                    pageId: pages[i].id,
                    level: pages[i].level + 1
                });
            }

            this.attrs.changePageLevel(pendingChanges);

            this.showNotification("Indent");
            this.audit.record("changed-page-sequence");
            this.send('onEntryClick', this.get('page'));
        },

        // Outdent - changes a page from H3 to H2, etc.
        pageOutdent() {
            if (this.outdentDisabled) {
                return;
            }

            var pages = this.get('pages');
            var current = _.findWhere(pages, {
                id: this.get('page')
            });
            var pageIndex = _.indexOf(pages, current, false);
            var pendingChanges = [];

            pendingChanges.push({
                pageId: current.id,
                level: current.level - 1
            });

            for (var i = pageIndex + 1; i < pages.length; i++) {
                if (pages[i].level <= current.level) {
                    break;
                }

                pendingChanges.push({
                    pageId: pages[i].id,
                    level: pages[i].level - 1
                });
            }

            this.attrs.changePageLevel(pendingChanges);

            this.showNotification("Outdent");
            this.audit.record("changed-page-sequence");
            this.send('onEntryClick', this.get('page'));
        },

        onEntryClick(id) {
            this.setState(id);
            this.attrs.gotoPage(id);
        },
    },
});
