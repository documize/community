import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
	normalize(modelClass, resourceHash) {
		return {
			data: {
				id: resourceHash.id ? resourceHash.id : resourceHash.folderId + resourceHash.userId,
				type: modelClass.modelName,
				attributes: resourceHash
			}
		};
	}
});
