import Ember from 'ember';
import NotifierMixin from '../../../mixins/notifier';

export default Ember.Controller.extend(NotifierMixin, {
	documentService: Ember.inject.service('document'),

	actions: {
		onCancel() {
			this.transitionToRoute('document');
		},

		onAddSection(section) {
			this.audit.record("added-section-" + section.get('contentType'));

			let page = {
				documentId: this.get('model.document.id'),
				title: `${section.get('title')}`,
				level: 1,
				sequence: 0,
				body: "",
				contentType: section.get('contentType'),
				pageType: section.get('pageType')
			};

			let meta = {
				documentId: this.get('model.document.id'),
				rawBody: "",
				config: "",
				externaleSource: true
			};

			let model = {
				page: page,
				meta: meta
			};

			this.get('documentService').addPage(this.get('model.document.id'), model).then((newPage) => {
				let data = this.get('store').normalize('page', newPage);
				this.get('store').push(data);

				this.get('documentService').getPages(this.get('model.document.id')).then((pages) => {
					this.set('model.pages', pages.filterBy('pageType', 'section'));
					this.set('model.tabs', pages.filterBy('pageType', 'tab'));

					this.get('documentService').getPageMeta(this.get('model.document.id'), newPage.id).then(() => {
						let options = {};
						options['mode'] = 'edit';
						this.transitionToRoute('document.section', newPage.id,  { queryParams: options });
					});
				});
			});
		}
	}
});
