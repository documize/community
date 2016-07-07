import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
    folderService: Ember.inject.service('folder'),

    beforeModel() {
        if (!this.session.isAdmin) {
            this.transitionTo('auth.login');
        }
    },

    model() {
        return this.get('folderService').getAll();
    },

    setupController(controller, model) {
        let nonPrivateFolders = model.rejectBy('folderType', 2);
        controller.set('folders', nonPrivateFolders);

        this.get('folderService').getProtectedFolderInfo().then(function(people){
            people.forEach(function(person){
                person.isEveryone = person.userId === '';
                person.isOwner = false;
            });

            nonPrivateFolders.forEach(function(folder){
                let shared = people.filterBy('folderId', folder.get('id'));
                let person = shared.findBy('userId', folder.get('userId'));
                if (is.not.undefined(person)) {
                    person.isOwner = true;
                }

                folder.set('sharedWith', shared);
            });
        });
    },

    activate() {
        document.title = "Folders | Documize";
    },

    actions: {
        onChangeOwner() {
            this.refresh();
        }
    }
});
