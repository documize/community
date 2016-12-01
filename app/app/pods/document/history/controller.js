import Ember from 'ember';
import NotifierMixin from '../../../mixins/notifier';

export default Ember.Controller.extend(NotifierMixin, {
	documentService: Ember.inject.service('document'),

	actions: {
		onFetchDiff(pageId, revisionId) {
			this.audit.record("compared-diff");

			this.get('documentService').getPageRevisionDiff(this.get('model.document.id'), pageId, revisionId).then((revision) => {
				this.set('model.diff', revision);
			});
		},

		onRollback(pageId, revisionId) {
			this.audit.record("restored-page");

			this.get('documentService').rollbackPage(this.get('model.document.id'), pageId, revisionId).then(() => {
				this.transitionToRoute('document', {
					queryParams: {
						page: pageId
					}
				});
			});
		}
	}
});
