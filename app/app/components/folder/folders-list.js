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
import constants from '../../utils/constants';
import TooltipMixin from '../../mixins/tooltip';
import NotifierMixin from '../../mixins/notifier';

export default Ember.Component.extend(TooltipMixin, NotifierMixin, {
	folderService: Ember.inject.service('folder'),
	templateService: Ember.inject.service('template'),
	publicFolders: [],
	protectedFolders: [],
	privateFolders: [],
	savedTemplates: [],
	hasPublicFolders: false,
	hasProtectedFolders: false,
	hasPrivateFolders: false,
	newFolder: "",
	showScrollTool: false,
	showingDocument: false,
	showingList: true,

	init() {
		this._super(...arguments);

		let _this = this;
		this.get('templateService').getSavedTemplates().then(function(saved) {
            let emptyTemplate = {
                id: "0",
                title: "Empty",
				description: "An empty canvas for your words",
				img: "template-blank",
				locked: true
            };

			saved.forEach(function(t) {
				t.img = "template-saved";
			});

            saved.unshiftObject(emptyTemplate);
            _this.set('savedTemplates', saved);
        });
	},

	didRender() {
		if (this.get('folderService').get('canEditCurrentFolder')) {
			this.addTooltip(document.getElementById("start-document-button"));
		}
	},

	didInsertElement() {
		this.eventBus.subscribe('resized', this, 'positionTool');
		this.eventBus.subscribe('scrolled', this, 'positionTool');
	},

	didReceiveAttrs() {
		let folders = this.get('folders');

		// clear out state
		this.set('publicFolders', []);
		this.set('protectedFolders', []);
		this.set('privateFolders', []);

		_.each(folders, folder => {
			if (folder.get('folderType') === constants.FolderType.Public) {
				let folders = this.get('publicFolders');
				folders.pushObject(folder);
				this.set('publicFolders', folders);
			}
			if (folder.get('folderType') === constants.FolderType.Private) {
				let folders = this.get('privateFolders');
				folders.pushObject(folder);
				this.set('privateFolders', folders);
			}
			if (folder.get('folderType') === constants.FolderType.Protected) {
				let folders = this.get('protectedFolders');
				folders.pushObject(folder);
				this.set('protectedFolders', folders);
			}
		});

		this.set('hasPublicFolders', this.get('publicFolders.length') > 0);
		this.set('hasPrivateFolders', this.get('privateFolders.length') > 0);
		this.set('hasProtectedFolders', this.get('protectedFolders.length') > 0);
	},

	willDestroyElement() {
		this.destroyTooltips();
	},

	positionTool() {
		if (this.get('isDestroyed') || this.get('isDestroying')) {
			return;
		}

		let s = $(".scroll-space-tool");
		let windowpos = $(window).scrollTop();

		if (windowpos >= 300) {
			this.set('showScrollTool', true);
			s.addClass("stuck-space-tool");
			s.css('left', parseInt($(".zone-sidebar").css('width')) - 18 + 'px');
		} else {
			this.set('showScrollTool', false);
			s.removeClass("stuck-space-tool");
		}
	},

	navigateToDocument(document) {
        this.attrs.showDocument(this.get('folder'), document);
    },

	actions: {
		scrollTop() {
			this.set('showScrollTool', false);

			$("html,body").animate({
				scrollTop: 0
			}, 500, "linear");
		},

		addFolder() {
			var folderName = this.get('newFolder');

			if (is.empty(folderName)) {
				$("#new-folder-name").addClass("error").focus();
				return false;
			}

			this.attrs.onFolderAdd(folderName);

			this.set('newFolder', "");
			return true;
		},

		showDocument() {
			this.set('showingDocument', true);
			this.set('showingList', false);
		},

		showList() {
			this.set('showingDocument', false);
			this.set('showingList', true);
		},

		onEditTemplate(template) {
            this.navigateToDocument(template);
        },

        onDocumentTemplate(id /*, title, type*/ ) {
            let self = this;

            this.send("showNotification", "Creating");

            this.get('templateService').importSavedTemplate(this.folder.get('id'), id).then(function(document) {
                self.navigateToDocument(document);
            });
        }
	}
});
