import Ember from 'ember';
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

  let attributes = Ember.merge({}, config.APP);
  attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

  Ember.run(() => {
    application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
  });

  return application;
}
