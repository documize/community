import Ember from 'ember';
import NotifierMixin from "../../mixins/notifier";
import Encoding from "../../utils/encoding";

export default Ember.Controller.extend(NotifierMixin, {
    actions: {
        save() {
            if (is.empty(this.model.title)) {
                $("#siteTitle").addClass("error").focus();
                return;
            }

            if (is.empty(this.model.firstname)) {
                $("#adminFirstname").addClass("error").focus();
                return;
            }

            if (is.empty(this.model.lastname)) {
                $("#adminLastname").addClass("error").focus();
                return;
            }

            if (is.empty(this.model.email)) {
                $("#adminEmail").addClass("error").focus();
                return;
            }

            if (!is.email(this.model.email)) {
                $("#adminEmail").addClass("error").focus();
                return;
            }

            if (is.empty(this.model.password)) {
                $("#adminPassword").addClass("error").focus();
                return;
            }

            this.model.allowAnonymousAccess = Ember.$("#allowAnonymousAccess").prop('checked');

            let self = this;

            $.ajax({
                type: 'POST',
                url: "/setup",
                data: self.model,
                dataType: "text",
                success: function() {
                    var credentials = Encoding.Base64.encode(":" + self.model.email + ":" + self.model.password);
                    debugger;
                    window.location.href = "/auth/sso/" + encodeURIComponent(credentials);
                },
                error: function(x) {
                    // TODO notify user of the error within the GUI
                    console.log("Something went wrong attempting database creation, see server log: " + x);
                }
            });
        }
    }
});