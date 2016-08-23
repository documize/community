import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
	normalize(modelClass, resourceHash) {
		return {
			id: resourceHash.userId ? resourceHash.userId : 'public',
			type: modelClass.modelName,
			attributes: resourceHash
		};
	}
});
