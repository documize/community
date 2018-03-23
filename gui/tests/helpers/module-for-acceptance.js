import { resolve } from 'rsvp';
import { module } from 'qunit';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

export default function(name, options = {}) {
	module(name, {
		beforeEach() {
			this.application = startApp();
			// localStorage.setItem('folder', 'VzMuyEw_3WqiafcG');
			// stubAudit(this);
			// stubUserNotification(this);
			// server.createList('folder', 2);
			// server.createList('user', 2);
			// server.createList('document', 2);
			// server.createList('permission', 4);
			// // server.createList('folder-permission', 2);
			// server.createList('organization', 1);

			if (options.beforeEach) {
				return options.beforeEach.apply(this, arguments);
			}
		},

		afterEach() {
			let afterEach = options.afterEach && options.afterEach.apply(this, arguments);
			return resolve(afterEach).then(() => destroyApp(this.application));
		}
	});
}
