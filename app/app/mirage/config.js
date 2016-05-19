export default function() {

    this.passthrough('https://widget.intercom.io/widget/%7Bapp_id%7D');
    this.urlPrefix = 'https://localhost:5001';    // make this `http://localhost:8080`, for example, if your API is on a different server
    this.namespace = 'api';    // make this `api`, for example, if your API is namespaced
    // this.timing = 400;      // delay for each request, automatically set to 0 during testing

    this.get('/public/meta', function () {
        return {
            "orgId":"VzMuyEw_3WqiafcD",
            "title":"EmberSherpa",
            "message":"This Documize instance contains all our team documentation",
            "url":"",
            "allowAnonymousAccess":true,
            "version":"11.2"
        };
    });

    this.get('/public/validate', function (db, request) {
        let serverToken = request.queryParams.token;
        let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb21haW4iOiIiLCJleHAiOjE0NjQwMjM2NjcsImlzcyI6IkRvY3VtaXplIiwib3JnIjoiVnpNdXlFd18zV3FpYWZjRCIsInN1YiI6IndlYmFwcCIsInVzZXIiOiJWek11eUV3XzNXcWlhZmNFIn0.NXZ6bo8mtvdZF_b9HavbidVUJqhmBA1zr0fSAPvbah0"

        if(token = serverToken){
            return {
                "id":"VzMuyEw_3WqiafcE",
                "created":"2016-05-11T15:08:24Z",
                "revised":"2016-05-11T15:08:24Z",
                "firstname":"Lennex",
                "lastname":"Zinyando",
                "email":"brizdigital@gmail.com",
                "initials":"LZ",
                "active":true,
                "editor":true,
                "admin":true,
                "accounts":[{
                    "id":"VzMuyEw_3WqiafcF",
                    "created":"2016-05-11T15:08:24Z",
                    "revised":"2016-05-11T15:08:24Z",
                    "admin":true,
                    "editor":true,
                    "userId":"VzMuyEw_3WqiafcE",
                    "orgId":"VzMuyEw_3WqiafcD",
                    "company":"EmberSherpa",
                    "title":"EmberSherpa",
                    "message":"This Documize instance contains all our team documentation",
                    "domain":""
                }
            ]
        };
    }
});

this.get('/users/0/permissions', function () {
    return [
        {
            "folderId":"VzMygEw_3WrtFzto",
            "userId":"",
            "canView":true,
            "canEdit":false
        }
    ];
});

this.get('/templates', function () {
    return [];
});

this.get('/folders/VzMuyEw_3WqiafcG', function () {
    return {
        "id":"VzMuyEw_3WqiafcG",
        "created":"2016-05-11T15:08:24Z",
        "revised":"2016-05-11T15:08:24Z",
        "name":"My Project",
        "orgId":"VzMuyEw_3WqiafcD",
        "userId":"VzMuyEw_3WqiafcE",
        "folderType":2
    };
});

this.get('/documents', function (db, request) {
    let folder_id = request.queryParams.folder;

    if (folder_id = "VzMuyEw_3WqiafcG"){
        return [
            {
                "id":"VzMwX0w_3WrtFztd",
                "created":"2016-05-11T13:15:11Z",
                "revised":"2016-05-11T13:22:16Z",
                "orgId":"VzMuyEw_3WqiafcD",
                "folderId":"VzMuyEw_3WqiafcG",
                "userId":"VzMuyEw_3WqiafcE",
                "job":"",
                "location":"template-0",
                "name":"Empty Document",
                "excerpt":"My test document",
                "tags":"",
                "template":false
            },{
                "id":"VzMvJEw_3WqiafcI",
                "created":"2016-05-11T13:09:56Z",
                "revised":"2016-05-11T13:09:56Z",
                "orgId":"VzMuyEw_3WqiafcD",
                "folderId":"VzMuyEw_3WqiafcG",
                "userId":"VzMuyEw_3WqiafcE",
                "job":"0bf9b076-cb74-4e8e-75be-8ee2d24a8171",
                "location":"/var/folders/d6/kr81d2fs5bsbm8rz2p092fy80000gn/T/documize/_uploads/0bf9b076-cb74-4e8e-75be-8ee2d24a8171/README.md",
                "name":"README",
                "excerpt":"To Document/ Instructions. GO. go- bindata- assetsfs. SSL.",
                "tags":"",
                "template":false
            }
        ];
    } else if (folder_id = "VzMygEw_3WrtFzto"){
        return {
            "id":"VzMygEw_3WrtFzto",
            "created":"2016-05-11T13:24:17Z",
            "revised":"2016-05-11T13:25:51Z",
            "name":"Test",
            "orgId":"VzMuyEw_3WqiafcD",
            "userId":"VzMuyEw_3WqiafcE",
            "folderType":1
        };
    }
});

this.get('/folders', function() {
    return [
        {
            "id":"VzMuyEw_3WqiafcG",
            "created":"2016-05-11T15:08:24Z",
            "revised":"2016-05-11T15:08:24Z",
            "name":"My Project","orgId":"VzMuyEw_3WqiafcD",
            "userId":"VzMuyEw_3WqiafcE",
            "folderType":2
        },{
            "id":"VzMygEw_3WrtFzto",
            "created":"2016-05-11T13:24:17Z",
            "revised":"2016-05-11T13:25:51Z",
            "name":"Test",
            "orgId":"VzMuyEw_3WqiafcD",
            "userId":"VzMuyEw_3WqiafcE",
            "folderType":1
        }
    ];
});

this.post('/public/authenticate', () => {
    return {
        "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb21haW4iOiIiLCJleHAiOjE0NjQwMjM2NjcsImlzcyI6IkRvY3VtaXplIiwib3JnIjoiVnpNdXlFd18zV3FpYWZjRCIsInN1YiI6IndlYmFwcCIsInVzZXIiOiJWek11eUV3XzNXcWlhZmNFIn0.NXZ6bo8mtvdZF_b9HavbidVUJqhmBA1zr0fSAPvbah0",
        "user":{
            "id":"VzMuyEw_3WqiafcE",
            "created":"2016-05-11T15:08:24Z",
            "revised":"2016-05-11T15:08:24Z",
            "firstname":"Lennex",
            "lastname":"Zinyando",
            "email":"brizdigital@gmail.com",
            "initials":"LZ",
            "active":true,
            "editor":true,
            "admin":true,
            "accounts":[
                {
                    "id":"VzMuyEw_3WqiafcF",
                    "created":"2016-05-11T15:08:24Z",
                    "revised":"2016-05-11T15:08:24Z",
                    "admin":true,
                    "editor":true,
                    "userId":"VzMuyEw_3WqiafcE",
                    "orgId":"VzMuyEw_3WqiafcD",
                    "company":"EmberSherpa",
                    "title":"EmberSherpa",
                    "message":"This Documize instance contains all our team documentation",
                    "domain":""
                }
            ]
        }
    };
});

this.get('/users/VzMuyEw_3WqiafcE/permissions', () => {
    return [
        {
            "folderId":"VzMuyEw_3WqiafcG",
            "userId":"VzMuyEw_3WqiafcE",
            "canView":true,
            "canEdit":true
        },{
            "folderId":"VzMygEw_3WrtFzto",
            "userId":"VzMuyEw_3WqiafcE",
            "canView":true,
            "canEdit":true
        },{
            "folderId":"VzMygEw_3WrtFzto",
            "userId":"",
            "canView":true,
            "canEdit":false
        }
    ];
});

this.get('/folders/VzMygEw_3WrtFzto', () => {
    return {
        "id":"VzMygEw_3WrtFzto",
        "created":"2016-05-11T13:24:17Z",
        "revised":"2016-05-11T13:25:51Z",
        "name":"Test",
        "orgId":"VzMuyEw_3WqiafcD",
        "userId":"VzMuyEw_3WqiafcE",
        "folderType":1
    };
});

this.get('/folders/VzMuyEw_3WqiafcG', () => {
    return {
        "id":"VzMuyEw_3WqiafcG",
        "created":"2016-05-11T15:08:24Z",
        "revised":"2016-05-11T15:08:24Z",
        "name":"My Project",
        "orgId":"VzMuyEw_3WqiafcD",
        "userId":"VzMuyEw_3WqiafcE",
        "folderType":2
    };
});

this.get('/folders/VzMuyEw_3WqiafcG', () => {
    return {
        "id":"VzMuyEw_3WqiafcG",
        "created":"2016-05-11T15:08:24Z",
        "revised":"2016-05-11T15:08:24Z",
        "name":"My Project",
        "orgId":"VzMuyEw_3WqiafcD",
        "userId":"VzMuyEw_3WqiafcE",
        "folderType":2
    };
});

/**
very helpful for debugging
*/
this.handledRequest = function(verb, path, request) {
    console.log(`👊${verb} ${path}`);
};

this.unhandledRequest = function(verb, path, request) {
    console.log(`🔥${verb} ${path}`);
};

}
