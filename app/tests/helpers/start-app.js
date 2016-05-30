import Ember from 'ember';
import Application from '../../app';
import config from '../../config/environment';
import './stub-session';
import './stub-audit';
import './user-login';
import './allow-anonymous-access';
import './wait-to-appear';
import './stub-user-notification';

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
