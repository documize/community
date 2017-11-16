## Module Report
### Unknown Global

**Global**: `Ember.testing`

**Location**: `app/services/tether.js` at line 20

```js
export default Ember.Service.extend({
	createDrop() {
		if (Ember.testing) {
			return;
		}
```

### Unknown Global

**Global**: `Ember.testing`

**Location**: `app/services/tether.js` at line 27

```js
	},
	createTooltip() {
		if (Ember.testing) {
			return;
		}
```

### Unknown Global

**Global**: `Ember.Handlebars`

**Location**: `app/utils/model.js` at line 22

```js

	setSafe(attr, value) {
		this.set(attr, Ember.String.htmlSafe(Ember.Handlebars.Utils.escapeExpression(value)));
	}
});
```
