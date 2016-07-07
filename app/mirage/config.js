import Mirage from 'ember-cli-mirage';

export default function () {

	this.passthrough('https://widget.intercom.io/widget/%7Bapp_id%7D');
	this.urlPrefix = 'https://localhost:5001'; // make this `http://localhost:8080`, for example, if your API is on a different server
	this.namespace = 'api'; // make this `api`, for example, if your API is namespaced
	// this.timing = 400;      // delay for each request, automatically set to 0 during testing

	this.logging = true;

	this.get('/public/meta', function (schema) {
		return schema.db.meta[0];
	});

	this.get('/public/validate', function (schema, request) {
		let serverToken = request.queryParams.token;
		let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb21haW4iOiIiLCJleHAiOjE0NjQwMjM2NjcsImlzcyI6IkRvY3VtaXplIiwib3JnIjoiVnpNdXlFd18zV3FpYWZjRCIsInN1YiI6IndlYmFwcCIsInVzZXIiOiJWek11eUV3XzNXcWlhZmNFIn0.NXZ6bo8mtvdZF_b9HavbidVUJqhmBA1zr0fSAPvbah0";

		if (token = serverToken) {
			return {
				"id": "VzMuyEw_3WqiafcE",
				"created": "2016-05-11T15:08:24Z",
				"revised": "2016-05-11T15:08:24Z",
				"firstname": "Lennex",
				"lastname": "Zinyando",
				"email": "brizdigital@gmail.com",
				"initials": "LZ",
				"active": true,
				"editor": true,
				"admin": true,
				"accounts": [{
					"id": "VzMuyEw_3WqiafcF",
					"created": "2016-05-11T15:08:24Z",
					"revised": "2016-05-11T15:08:24Z",
					"admin": true,
					"editor": true,
					"userId": "VzMuyEw_3WqiafcE",
					"orgId": "VzMuyEw_3WqiafcD",
					"company": "EmberSherpa",
					"title": "EmberSherpa",
					"message": "This Documize instance contains all our team documentation",
					"domain": ""
				}]
			};
		}
	});

	this.get('/users/0/permissions', function () {
		return [{
			"folderId": "VzMygEw_3WrtFzto",
			"userId": "",
			"canView": true,
			"canEdit": false
		}];
	});

	this.get('/templates', function () {
		return [];
	});

	this.get('/documents', function (schema, request) {
		let folder_id = request.queryParams.folder;

		if (folder_id = "VzMuyEw_3WqiafcG") {
			return [{
				"id": "VzMwX0w_3WrtFztd",
				"created": "2016-05-11T13:15:11Z",
				"revised": "2016-05-11T13:22:16Z",
				"orgId": "VzMuyEw_3WqiafcD",
				"folderId": "VzMuyEw_3WqiafcG",
				"userId": "VzMuyEw_3WqiafcE",
				"job": "",
				"location": "template-0",
				"name": "Empty Document",
				"excerpt": "My test document",
				"tags": "",
				"template": false
			}, {
				"id": "VzMvJEw_3WqiafcI",
				"created": "2016-05-11T13:09:56Z",
				"revised": "2016-05-11T13:09:56Z",
				"orgId": "VzMuyEw_3WqiafcD",
				"folderId": "VzMuyEw_3WqiafcG",
				"userId": "VzMuyEw_3WqiafcE",
				"job": "0bf9b076-cb74-4e8e-75be-8ee2d24a8171",
				"location": "/var/folders/d6/kr81d2fs5bsbm8rz2p092fy80000gn/T/documize/_uploads/0bf9b076-cb74-4e8e-75be-8ee2d24a8171/README.md",
				"name": "README",
				"excerpt": "To Document/ Instructions. GO. go- bindata- assetsfs. SSL.",
				"tags": "",
				"template": false
			}];
		} else if (folder_id = "VzMygEw_3WrtFzto") {
			return {
				"id": "VzMygEw_3WrtFzto",
				"created": "2016-05-11T13:24:17Z",
				"revised": "2016-05-11T13:25:51Z",
				"name": "Test",
				"orgId": "VzMuyEw_3WqiafcD",
				"userId": "VzMuyEw_3WqiafcE",
				"folderType": 1
			};
		} else if (folder_id = 'V0Vy5Uw_3QeDAMW9') {
			return null;
		}
	});

	this.get('/folders', function (schema) {
		return schema.db.folders;
	});

	this.post('/folders', function (schema, request) {
		var name = JSON.parse(request.requestBody).name;
		let newFolder = {
			"id": "V0Vy5Uw_3QeDAMW9",
			"created": "2016-05-25T09:39:49Z",
			"revised": "2016-05-25T09:39:49Z",
			"name": name,
			"orgId": "VzMuyEw_3WqiafcD",
			"userId": "VzMuyEw_3WqiafcE",
			"folderType": 2
		};

		let folder = schema.db.folders.insert(newFolder);
		return folder;
	});

	this.post('/public/authenticate', (schema, request) => {
		let authorization = request.requestHeaders.Authorization;
		let expectedAuthorization = "Basic OmJyaXpkaWdpdGFsQGdtYWlsLmNvbTp6aW55YW5kbzEyMw==";

		if (expectedAuthorization == authorization) {
			console.log("SSO login success");
			return {
				"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb21haW4iOiIiLCJleHAiOjE0NjQwMjM2NjcsImlzcyI6IkRvY3VtaXplIiwib3JnIjoiVnpNdXlFd18zV3FpYWZjRCIsInN1YiI6IndlYmFwcCIsInVzZXIiOiJWek11eUV3XzNXcWlhZmNFIn0.NXZ6bo8mtvdZF_b9HavbidVUJqhmBA1zr0fSAPvbah0",
				"user": {
					"id": "VzMuyEw_3WqiafcE",
					"created": "2016-05-11T15:08:24Z",
					"revised": "2016-05-11T15:08:24Z",
					"firstname": "Lennex",
					"lastname": "Zinyando",
					"email": "brizdigital@gmail.com",
					"initials": "LZ",
					"active": true,
					"editor": true,
					"admin": true,
					"accounts": [{
						"id": "VzMuyEw_3WqiafcF",
						"created": "2016-05-11T15:08:24Z",
						"revised": "2016-05-11T15:08:24Z",
						"admin": true,
						"editor": true,
						"userId": "VzMuyEw_3WqiafcE",
						"orgId": "VzMuyEw_3WqiafcD",
						"company": "EmberSherpa",
						"title": "EmberSherpa",
						"message": "This Documize instance contains all our team documentation",
						"domain": ""
					}]
				}
			};
		}

		if (expectedAuthorization != authorization) {
			return new Mirage.Response(401, { 'Content-Type': 'application/json' }, { message: 'Bad Request' });
		}

		return {
			"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb21haW4iOiIiLCJleHAiOjE0NjQwMjM2NjcsImlzcyI6IkRvY3VtaXplIiwib3JnIjoiVnpNdXlFd18zV3FpYWZjRCIsInN1YiI6IndlYmFwcCIsInVzZXIiOiJWek11eUV3XzNXcWlhZmNFIn0.NXZ6bo8mtvdZF_b9HavbidVUJqhmBA1zr0fSAPvbah0",
			"user": {
				"id": "VzMuyEw_3WqiafcE",
				"created": "2016-05-11T15:08:24Z",
				"revised": "2016-05-11T15:08:24Z",
				"firstname": "Lennex",
				"lastname": "Zinyando",
				"email": "brizdigital@gmail.com",
				"initials": "LZ",
				"active": true,
				"editor": true,
				"admin": true,
				"accounts": [{
					"id": "VzMuyEw_3WqiafcF",
					"created": "2016-05-11T15:08:24Z",
					"revised": "2016-05-11T15:08:24Z",
					"admin": true,
					"editor": true,
					"userId": "VzMuyEw_3WqiafcE",
					"orgId": "VzMuyEw_3WqiafcD",
					"company": "EmberSherpa",
					"title": "EmberSherpa",
					"message": "This Documize instance contains all our team documentation",
					"domain": ""
				}]
			}
		};

	});

	this.get('/users/VzMuyEw_3WqiafcE/permissions', (schema) => {
		return schema.db.permissions;
	});

	this.get('/folders/VzMuyEw_3WqiafcG/permissions', () => {
		return [{
			"folderId": "VzMuyEw_3WqiafcG",
			"userId": "VzMuyEw_3WqiafcE",
			"canView": true,
			"canEdit": true
		}];
	});

	this.put('/folders/VzMygEw_3WrtFzto/permissions', () => {
		return [{
			"orgId": "VzMuyEw_3WqiafcD",
			"folderId": "VzMygEw_3WrtFzto",
			"userId": "",
			"canEdit": true,
			"canView": true
		}, {
			"orgId": "VzMuyEw_3WqiafcD",
			"folderId": "VzMygEw_3WrtFzto",
			"userId": "VzMyp0w_3WrtFztq",
			"canEdit": false,
			"canView": false
		}, {
			"orgId": "",
			"folderId": "VzMygEw_3WrtFzto",
			"userId": "VzMuyEw_3WqiafcE",
			"canEdit": true,
			"canView": true
		}];
	});

	this.get('/folders/VzMygEw_3WrtFzto/permissions', () => {
		return [{
			"folderId": "VzMygEw_3WrtFzto",
			"userId": "VzMuyEw_3WqiafcE",
			"canView": true,
			"canEdit": true
		}];
	});

	this.put('/folders/:id', (schema, request) => {
		let id = request.params.id;
		let attrs = JSON.parse(request.requestBody);
		let folder = schema.db.folders.update(id, attrs);
		return folder;
	});

	this.put('/folders/V0Vy5Uw_3QeDAMW9', () => {
		return {
			"id": "V0Vy5Uw_3QeDAMW9",
			"created": "2016-05-25T09:39:49Z",
			"revised": "2016-05-25T09:39:49Z",
			"name": "Test Folder",
			"orgId": "VzMuyEw_3WqiafcD",
			"userId": "VzMuyEw_3WqiafcE",
			"folderType": 2
		};
	});

	this.get('folders/:id', (schema, request) => {
		let id = request.params.id;
		return schema.db.folders.find(id);
	});

	this.get('/organizations/VzMuyEw_3WqiafcD', () => {
		return {
			"id": "VzMuyEw_3WqiafcD",
			"created": "2016-05-11T15:08:24Z",
			"revised": "2016-05-23T11:23:20Z",
			"title": "EmberSherpa",
			"message": "This Documize instance contains all our team documentation",
			"url": "",
			"domain": "",
			"email": "brizdigital@gmail.com",
			"allowAnonymousAccess": false
		};
	});

	this.put('/organizations/VzMuyEw_3WqiafcD', (schema, request) => {
		let title = JSON.parse(request.requestBody).title;
		let message = JSON.parse(request.requestBody).title;
		let allowAnonymousAccess = JSON.parse(request.requestBody).allowAnonymousAccess;

		return {
			"id": "VzMuyEw_3WqiafcD",
			"created": "2016-05-11T15:08:24Z",
			"revised": "2016-05-23T11:23:20Z",
			"title": `${title}`,
			"message": `${message}`,
			"url": "",
			"domain": "",
			"email": "brizdigital@gmail.com",
			"allowAnonymousAccess": `${allowAnonymousAccess}`
		};
	});

	this.get('/users', () => {
		return [{
			"id": "VzMyp0w_3WrtFztq",
			"created": "2016-05-11T13:24:55Z",
			"revised": "2016-05-11T13:33:47Z",
			"firstname": "Len",
			"lastname": "Random",
			"email": "zinyando@gmail.com",
			"initials": "LR",
			"active": true,
			"editor": true,
			"admin": false,
			"accounts": [{
				"id": "VzMyp0w_3WrtFztr",
				"created": "2016-05-11T13:24:55Z",
				"revised": "2016-05-11T13:24:55Z",
				"admin": false,
				"editor": true,
				"userId": "VzMyp0w_3WrtFztq",
				"orgId": "VzMuyEw_3WqiafcD",
				"company": "EmberSherpa",
				"title": "EmberSherpa",
				"message": "This Documize instance contains all our team documentation",
				"domain": ""
			}]
		}, {
			"id": "VzMuyEw_3WqiafcE",
			"created": "2016-05-11T15:08:24Z",
			"revised": "2016-05-11T15:08:24Z",
			"firstname": "Lennex",
			"lastname": "Zinyando",
			"email": "brizdigital@gmail.com",
			"initials": "LZ",
			"active": true,
			"editor": true,
			"admin": true,
			"accounts": [{
				"id": "VzMuyEw_3WqiafcF",
				"created": "2016-05-11T15:08:24Z",
				"revised": "2016-05-11T15:08:24Z",
				"admin": true,
				"editor": true,
				"userId": "VzMuyEw_3WqiafcE",
				"orgId": "VzMuyEw_3WqiafcD",
				"company": "EmberSherpa",
				"title": "EmberSherpa",
				"message": "This Documize instance contains all our team documentation",
				"domain": ""
			}]
		}];
	});

	this.post('/users', (schema, request) => {
		let firstname = JSON.parse(request.requestBody).firstname;
		let lastname = JSON.parse(request.requestBody).lastname;
		let email = JSON.parse(request.requestBody).email;

		return {
			"id": "V0RmtUw_3QeDAMW7",
			"created": "2016-05-24T14:35:33Z",
			"revised": "2016-05-24T14:35:33Z",
			"firstname": `${firstname}`,
			"lastname": `${lastname}`,
			"email": `${email}`,
			"initials": "TU",
			"active": true,
			"editor": true,
			"admin": false,
			"accounts": [{
				"id": "V0RmtUw_3QeDAMW8",
				"created": "2016-05-24T14:35:34Z",
				"revised": "2016-05-24T14:35:34Z",
				"admin": false,
				"editor": true,
				"userId": "V0RmtUw_3QeDAMW7",
				"orgId": "VzMuyEw_3WqiafcD",
				"company": "EmberSherpa",
				"title": "EmberSherpa",
				"message": "This Documize instance contains all our team documentation",
				"domain": ""
			}]
		};
	});

	this.get('/users/VzMuyEw_3WqiafcE', () => {

		return {
			"id": "VzMuyEw_3WqiafcE",
			"created": "2016-05-11T15:08:24Z",
			"revised": "2016-05-11T15:08:24Z",
			"firstname": "Lennex",
			"lastname": "Zinyando",
			"email": "brizdigital@gmail.com",
			"initials": "LZ",
			"active": true,
			"editor": true,
			"admin": true,
			"accounts": [{
				"id": "VzMuyEw_3WqiafcF",
				"created": "2016-05-11T15:08:24Z",
				"revised": "2016-05-11T15:08:24Z",
				"admin": true,
				"editor": true,
				"userId": "VzMuyEw_3WqiafcE",
				"orgId": "VzMuyEw_3WqiafcD",
				"company": "EmberSherpa",
				"title": "EmberSherpa",
				"message": "This Documize instance contains all our team documentation",
				"domain": ""
			}]
		};
	});

	this.put('/users/VzMuyEw_3WqiafcE', (schema, request) => {
		let firstname = JSON.parse(request.requestBody).firstname;
		let lastname = JSON.parse(request.requestBody).lastname;
		let email = JSON.parse(request.requestBody).email;

		return {
			"id": "VzMuyEw_3WqiafcE",
			"created": "2016-05-11T15:08:24Z",
			"revised": "2016-05-11T15:08:24Z",
			"firstname": `${firstname}`,
			"lastname": `${lastname}`,
			"email": `${email}`,
			"initials": "LZ",
			"active": true,
			"editor": true,
			"admin": true,
			"accounts": [{
				"id": "VzMuyEw_3WqiafcF",
				"created": "2016-05-11T15:08:24Z",
				"revised": "2016-05-11T15:08:24Z",
				"admin": true,
				"editor": true,
				"userId": "VzMuyEw_3WqiafcE",
				"orgId": "VzMuyEw_3WqiafcD",
				"company": "EmberSherpa",
				"title": "EmberSherpa",
				"message": "This Documize instance contains all our team documentation",
				"domain": ""
			}]
		};
	});

	this.post('/folders/VzMuyEw_3WqiafcG/invitation', () => {
		return {};
	});

}
