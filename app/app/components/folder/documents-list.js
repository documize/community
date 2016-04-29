import Ember from 'ember';

export default Ember.Component.extend({
    selectedDocuments: [],

    didReceiveAttrs() {
        this.set('selectedDocuments', []);
    },

    actions: {
        selectDocument(documentId) {
			let doc = this.get('documents').findBy('id', documentId);
			let list = this.get('selectedDocuments');

			doc.set('selected', !doc.get('selected'));

			if (doc.get('selected')) {
				list.push(documentId);
			} else {
				var index = list.indexOf(documentId);
				if (index > -1) {
					list.splice(index, 1);
				}
			}

			this.set('selectedDocuments', list);
			this.get('onDocumentsChecked')(list);
        }
    }
});
