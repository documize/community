import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
	normalize(modelClass, resourceHash) {
		let id = '0';
		if (resourceHash.whoId) id = resourceHash.whoId;
		if (resourceHash.id) id = resourceHash.id;

		return {
			data: {
				id: id,
				type: modelClass.modelName,
				attributes: resourceHash
			}
		};
	}
});
