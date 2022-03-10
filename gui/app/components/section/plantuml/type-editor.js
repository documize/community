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

import { schedule } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
	appMeta: service(),
	sectionSvc: service('section'),
    i18n: service(),
    isDirty: false,
    waiting: false,
    diagramText: '',
    diagramPreview: null,
    previewButtonCaption: '',
	editorId: computed('page', function () {
		let page = this.get('page');
		return `plantuml-editor-${page.id}`;
	}),
	previewId: computed('page', function () {
		let page = this.get('page');
		return `plantuml-preview-${page.id}`;
    }),
	emptyDiagram: computed('diagramText', function () {
		return _.isEmpty(this.get('diagramText'));
    }),

    init(...args) {
        this._super(...args);
        this.previewButtonCaption = this.i18n.localize('preview');
    },

    generatePreview() {
        this.set('waiting', true);
        this.set('previewButtonCaption', this.i18n.localize('preview_wait'));

        let self = this;
        let data = { data: this.get('diagramText') };

        schedule('afterRender', () => {
            this.get('sectionSvc').fetch(this.get('page'), 'preview', data).then(function (response) {
                self.set('diagramPreview', response.data);
                self.set('waiting', false);
                self.set('previewButtonCaption', this.i18n.localize('preview'));
            }, function (reason) { // eslint-disable-line no-unused-vars
                self.set('diagramPreview', null);
                self.set('waiting', false);
                self.set('previewButtonCaption', this.i18n.localize('preview'));
            });
        });
    },

    didReceiveAttrs() {
        this._super(...arguments);
        this.set('waiting', false);
        this.set('diagramText', this.get('meta.rawBody'));

        this.generatePreview();
    },

    actions: {
        isDirty() {
            return this.get('isDirty') || (this.get('diagramText') !== this.get('meta.rawBody'));
        },

        onCancel() {
            let cb = this.get('onCancel');
            cb();
        },

        onPreview() {
            this.generatePreview();
        },

        onAction(title) {
            this.set('waiting', true);
            let page = this.get('page');
            let meta = this.get('meta');

            meta.set('rawBody', this.get('diagramText'));
            page.set('title', title);

            let cb = this.get('onAction');
            cb(page, meta);
            this.set('waiting', false);
        },

        onInsertActivity() {
            let txt  = `
@startuml
title Servlet Container

(*) --> "ClickServlet.handleRequest()"
--> "new Page"

if "Page.onSecurityCheck" then
    ->[true] "Page.onInit()"

    if "isForward?" then
    ->[no] "Process controls"

    if "continue processing?" then
        -->[yes] ===RENDERING===
    else
        -->[no] ===REDIRECT_CHECK===
    endif

    else
    -->[yes] ===RENDERING===
    endif

    if "is Post?" then
    -->[yes] "Page.onPost()"
    --> "Page.onRender()" as render
    --> ===REDIRECT_CHECK===
    else
    -->[no] "Page.onGet()"
    --> render
    endif

else
    -->[false] ===REDIRECT_CHECK===
endif

if "Do redirect?" then
    ->[yes] "redirect request"
    --> ==BEFORE_DESTROY===
else
    if "Do Forward?" then
    -left->[yes] "Forward request"
    --> ==BEFORE_DESTROY===
    else
    -right->[no] "Render page template"
    --> ==BEFORE_DESTROY===
    endif
endif

--> "Page.onDestroy()"
-->(*)
@enduml`;

            this.set('diagramText', txt);
            this.generatePreview();
        },

        onInsertSequence() {
            let txt  = `
@startuml
actor Bob #red
' The only difference between actor
'and participant is the drawing
participant Alice
participant "I have a reallylong name" as L #99FF99
/' You can also declare:
    participant L as "I have a really long name"  #99FF99
    '/

Alice->Bob: Authentication Request
Bob->Alice: Authentication Response
Bob->L: Log transaction
@enduml`;

            this.set('diagramText', txt);
            this.generatePreview();
        },

        onInsertUseCase() {
            let txt  = `
@startuml
:Main Admin: as Admin
(Use the application) as (Use)

User -> (Start)
User --> (Use)

Admin ---> (Use)

note right of Admin : This is an example.

note right of (Use)
    A note can also
    be on several lines
end note

note "This note is connected to several objects." as N2
(Start) .. N2
N2 .. (Use)
@enduml
`;

            this.set('diagramText', txt);
            this.generatePreview();
        },

        onInsertClass() {
            let txt  = `
@startuml
class Foo1 {
    You can use
    several lines
    ..
    as you want
    and group
    ==
    things together.
    __
    You can have as many groups
    as you want
    --
    End of class
}

class User {
    .. Simple Getter ..
    + getName()
    + getAddress()
    .. Some setter ..
    + setName()
    __ private data __
    int age
    -- encrypted --
    String password
}

@enduml`;

            this.set('diagramText', txt);
            this.generatePreview();
        },

        onInsertActivityNew() {
            let txt  = `
@startuml

start
:ClickServlet.handleRequest();
:new page;
if (Page.onSecurityCheck) then (true)
    :Page.onInit();
    if (isForward?) then (no)
    :Process controls;
    if (continue processing?) then (no)
        stop
    endif

    if (isPost?) then (yes)
        :Page.onPost();
    else (no)
        :Page.onGet();
    endif
    :Page.onRender();
    endif
else (false)
endif

if (do redirect?) then (yes)
    :redirect process;
else
    if (do forward?) then (yes)
    :Forward request;
    else (no)
    :Render page template;
    endif
endif

stop

@enduml`;

            this.set('diagramText', txt);
            this.generatePreview();
        },

        onInsertComponent() {
            let txt  = `
@startuml

package "Some Group" {
    HTTP - [First Component]
    [Another Component]
}

node "Other Groups" {
    FTP - [Second Component]
    [First Component] --> FTP
}

cloud {
    [Example 1]
}


database "MySql" {
    folder "This is my folder" {
    [Folder 3]
    }
    frame "Foo" {
    [Frame 4]
    }
}


[Another Component] --> [Example 1]
[Example 1] --> [Folder 3]
[Folder 3] --> [Frame 4]

@enduml`;

            this.set('diagramText', txt);
            this.generatePreview();
        },

        onInsertState() {
            let txt  = `
@startuml
scale 600 width

[*] -> State1
State1 --> State2 : Succeeded
State1 --> [*] : Aborted
State2 --> State3 : Succeeded
State2 --> [*] : Aborted
state State3 {
    state "Some State Name" as long1
    long1 : Just a test
    [*] --> long1
    long1 --> long1 : New Data
    long1 --> ProcessData : Enough Data
}
State3 --> State3 : Failed
State3 --> [*] : Succeeded / Save Result
State3 --> [*] : Aborted

@enduml`;

            this.set('diagramText', txt);
            this.generatePreview();
        }
    }
});
