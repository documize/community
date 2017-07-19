import Ember from 'ember';
import NotifierMixin from '../../../mixins/notifier';

export default Ember.Controller.extend(NotifierMixin, {
	documentService: Ember.inject.service('document'),

	actions: {
		onFetchDiff(pageId, revisionId) {
			this.get('documentService').getPageRevisionDiff(this.get('model.document.id'), pageId, revisionId).then((revision) => {
				this.set('model.diff', revision);
			});
		},

		onRollback(pageId, revisionId) {
			this.get('documentService').rollbackPage(this.get('model.document.id'), pageId, revisionId).then(() => {
				this.transitionToRoute('document.index',
					this.get('model.folder.id'),
					this.get('model.folder.slug'),
					this.get('model.document.id'),
					this.get('model.document.slug'));
			});
		}
	}
});
