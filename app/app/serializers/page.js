import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
	normalize(modelClass, resourceHash) {
		return {
			id: resourceHash.id ? resourceHash.id : resourceHash.documentId,
			type: modelClass.modelName,
			attributes: resourceHash
		};
	}
});
