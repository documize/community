import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
	normalize(modelClass, resourceHash) {
		return {
			data: {
				id: resourceHash.userId ? resourceHash.userId : 0,
				type: modelClass.modelName,
				attributes: resourceHash
			}
		};
	}
});
