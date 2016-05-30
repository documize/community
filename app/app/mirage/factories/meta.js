/*
  This is an example factory definition.

  Create more files in this directory to define additional factories.
*/
import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  orgId() { return "VzMuyEw_3WqiafcD"; },
  title() { return "EmberSherpa"; },
  message() { return "This Documize instance contains all our team documentation"; },
  url() { return ""; },
  allowAnonymousAccess() { return false; },
  version() { return "11.2"; }
});
