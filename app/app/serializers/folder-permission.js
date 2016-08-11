import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
	normalize(modelClass, resourceHash) {
		return {
			id: resourceHash.folderId,
			type: modelClass.modelName,
			attributes: resourceHash
		};
	}
});
