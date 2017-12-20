import { run } from '@ember/runloop';
import { merge } from '@ember/polyfills';
import Application from '../../app';
import config from '../../config/environment';
import './stub-audit';
import './user-login';
import './wait-to-appear';
import './wait-to-disappear';
import './stub-user-notification';
import './authenticate-user';

export default function startApp(attrs) {
	let application;

	let attributes = merge({}, config.APP);
	attributes = merge(attributes, attrs); // use defaults, but you can override;

	run(() => {
		application = Application.create(attributes);
		application.setupForTesting();
		application.injectTestHelpers();
	});

	return application;
}
