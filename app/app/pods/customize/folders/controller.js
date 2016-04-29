import Ember from 'ember';
import NotifierMixin from '../../../mixins/notifier';

export default Ember.Controller.extend(NotifierMixin, {
    folderService: Ember.inject.service('folder'),
    folders: [],

    label: function() {
        switch (this.get('folders').length) {
            case 1:
                return "space";
            default:
                return "spaces";
        }
    }.property('folders'),

    actions: {
        changeOwner: function(folderId, userId) {
            let self = this;
            this.get('folderService').getFolder(folderId).then(function(folder) {
                folder.set('userId', userId);

                self.get('folderService').save(folder).then(function() {
                    self.showNotification("Changed");
                    self.audit.record('changed-folder-owner');
                });

                self.send('onChangeOwner');
            });
        }
    }
});
