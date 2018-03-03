import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
	normalize(modelClass, resourceHash) {
		return {
			data: {
				id: resourceHash.whoId ? resourceHash.whoId : 0,
				type: modelClass.modelName,
				attributes: resourceHash
			}
		};
	}
});
