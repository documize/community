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

export default Ember.Component.extend({
    documentTags: [],
    tagz: [],
    newTag: "",
    maxTags: 3,
	canAdd: false,
	emptyState: Ember.computed('tagz', function() {
		return (this.get('tagz').length === 0 && !this.get('permissions.documentEdit'));
	}),

    init() {
		this._super(...arguments);
        let tagz = [];

        if (!_.isUndefined(this.get('documentTags')) && this.get('documentTags').length > 1) {
            let tags = this.get('documentTags').split('#');
            _.each(tags, function(tag) {
                if (tag.length > 0) {
                    tagz.pushObject(tag);
                }
            });
        }

        this.set('tagz', tagz);
        this.set('canAdd', this.get('permissions.documentEdit') && this.get('tagz').get('length') < 3);
    },

    didUpdateAttrs() {
		this._super(...arguments);
        this.set('canAdd', this.get('permissions.documentEdit') && this.get('tagz').get('length') < 3);
    },


    willDestroyElement() {
		this._super(...arguments);
		$("#add-tag-field").off("keydown");
    },

    actions: {
        onTagEditor() {
            $("#add-tag-field").off("keydown").on("keydown", function(e) {
                if (e.shiftKey) {
                    return false;
                }

                if (e.which === 13 || e.which === 45 || e.which === 189 || e.which === 8 || e.which === 127 || (e.which >= 65 && e.which <= 90) || (e.which >= 97 && e.which <= 122) || (e.which >= 48 && e.which <= 57)) {
                    return true;
                }

                return false;
            });
        },

        addTag() {
            let tags = this.get("tagz");
            let tag = this.get('newTag');
            tag = tag.toLowerCase().trim();

            // empty or dupe?
            if (tag.length === 0 || _.contains(tags, tag) || tags.length >= this.get('maxTags') || tag.startsWith('-')) {
                return false;
            }

            tags.pushObject(tag);
            this.set('tagz', tags);
            this.set('newTag', '');

            let save = "#";
            _.each(tags, function(tag) {
                save = save + tag + "#";
            });

            this.get('onChange')(save);

            return true;
        },

        // removeTag removes specified tag from the list of tags associated with this document.
        removeTag(tagToRemove) {
            let tags = this.get("tagz");
            let save = "";

            tags = _.without(tags, tagToRemove);

            _.each(tags, function(tag) {
                save = save + tag + "#";
            });

            if (save.length) {
                save = "#" + save;
            }

            this.set('tagz', tags);
            this.get('onChange')(save);
        },
    }
});
