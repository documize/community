// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

import Ember from 'ember';
import encodingUtil from '../../utils/encoding';
import netUtil from '../../utils/net';

export default Ember.Component.extend({
    folderService: Ember.inject.service('folder'),

    serial: "",
    folderId: "",
    slug: "",
    processing: false,

    didRender() {
        let self = this;

        $("#stage-1-firstname").focus();

        // Stage 1 - person name keypress handler
        $("#stage-1-firstname, #stage-1-lastname").keyup(function() {
            if (!$("#stage-1-firstname").val() || !$("#stage-1-lastname").val()) {
                $(".name-status").attr("src", "/assets/img/onboard/person-red.png");
            } else {
                $(".name-status").attr("src", "/assets/img/onboard/person-green.png");
            }
        });

        // Stage 1 - finish
        $("#stage-1-next").off('click').on('click', function() {
            if (!$("#stage-1-firstname").val()) {
                $("#stage-1-firstname").focus();
                $("#stage-1-firstname").addClass("error");
                $(".name-status").attr("src", "/assets/img/onboard/person-red.png");
                return;
            }

            if (!$("#stage-1-lastname").val()) {
                $("#stage-1-lastname").focus();
                $("#stage-1-lastname").addClass("error");
                $(".name-status").attr("src", "/assets/img/onboard/person-red.png");
                return;
            }

            self.set('processing', false);

            $(".stage-1").fadeOut("slow", function() {
                if (self.get('processing')) {
                    return;
                }

                self.set('processing', true);

                $(".stage-2").fadeIn();
                $("#stage-2-password").focus();

                // Stage 2 - password keypress handler
                $("#stage-2-password-confirm").keyup(function() {
                    if ($("#stage-2-password").val().length < 6 || $("#stage-2-password").val().length > 50 ||
                        ($("#stage-2-password").val() !== $("#stage-2-password-confirm").val())) {
                        $(".password-status").attr("src", "/assets/img/onboard/lock-red.png");
                    } else {
                        $(".password-status").attr("src", "/assets/img/onboard/lock-green.png");
                    }
                });
            });
        });

        // Stage 2 - finish
        $("#stage-2-next").off('click').on('click', function() {
            if (!$("#stage-2-password").val() || $("#stage-2-password").val().length < 6 || $("#stage-2-password").val().length > 50) {
                $("#stage-2-password").focus();
                $("#stage-2-password").addClass("error");
                return;
            }

            if (!$("#stage-2-password-confirm").val()) {
                $("#stage-2-password-confirm").focus();
                $("#stage-2-password-confirm").addClass("error");
                return;
            }

            if ($("#stage-2-password-confirm").val() !== $("#stage-2-password").val()) {
                $(".mismatch").show();
                $(".password-status").attr("src", "/assets/img/onboard/lock-red.png");
                return;
            }

            self.set('processing', false);

            $(".stage-2").fadeOut("slow", function() {
                if (self.get('processing')) {
                    return;
                }

                self.set('processing', true);

                $(".stage-3").fadeIn();
                $("#spinner-1").show();

                var payload = '{ "Password": "' + $("#stage-2-password").val() + '", "Serial": "' + self.serial + '", "Firstname": "' + $("#stage-1-firstname").val() + '", "Lastname": "' + $("#stage-1-lastname").val() + '" }';
                var password = $("#stage-2-password").val();

                self.get('folderService').onboard(self.folderId, payload).then(function(user) {
                    var credentials = encodingUtil.Base64.encode(netUtil.getSubdomain() + ":" + user.email + ":" + password);
                    self.session.sso(credentials).then(function() {
                        window.location.href = 's/' + self.folderId + "/" + self.slug;
                    });
                }, function() {
                    window.location.href = "/";
                });
            });
        });
    },
});
