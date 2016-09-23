import JSONAPISerializer from 'ember-data/serializers/json-api';

export default JSONAPISerializer.extend({
	normalize(modelClass, resourceHash) {
		return {
			data: {
				id: resourceHash.id,
				type: modelClass.modelName,
				attributes: resourceHash
			}
		};
	}
});
