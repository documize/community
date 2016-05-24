/*
  This is an example factory definition.

  Create more files in this directory to define additional factories.
*/
import Mirage/*, {faker} */ from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  orgId: "VzMuyEw_3WqiafcD",
  title: "EmberSherpa",
  message: "This Documize instance contains all our team documentation",
  url: "",
  allowAnonymousAccess: false,
  version: "11.2"
});
