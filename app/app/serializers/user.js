import JSONAPISerializer from 'ember-data/serializers/json-api';

export default JSONAPISerializer.extend({
	normalize(modelClass, resourceHash) {
		return {
			id: resourceHash.id,
			type: modelClass.modelName,
			attributes: resourceHash
		};
	}
});
