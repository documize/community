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
		}

		if (folder_id = "VzMygEw_3WrtFzto") {
			return {
				"id": "VzMygEw_3WrtFzto",
				"created": "2016-05-11T13:24:17Z",
				"revised": "2016-05-11T13:25:51Z",
				"name": "Test",
				"orgId": "VzMuyEw_3WqiafcD",
				"userId": "VzMuyEw_3WqiafcE",
				"folderType": 1
			};
		}

		if (folder_id = 'V0Vy5Uw_3QeDAMW9') {
			return null;
		}
	});

	this.get('/folders', function (schema) {
		return schema.db.folders;
	});

	this.post('/folders', function (schema, request) {
		debugger;
		var name = JSON.parse(request.requestBody).name;
		let folder = {
			"id": "V0Vy5Uw_3QeDAMW9",
			"created": "2016-05-25T09:39:49Z",
			"revised": "2016-05-25T09:39:49Z",
			"name": name,
			"orgId": "VzMuyEw_3WqiafcD",
			"userId": "VzMuyEw_3WqiafcE",
			"folderType": 2
		};

		return schema.db.folders.insert(folder);
	});

	this.post('/public/authenticate', (schema, request) => {
		let authorization = request.requestHeaders.Authorization;
		let expectedAuthorization = "Basic OmJyaXpkaWdpdGFsQGdtYWlsLmNvbTp6aW55YW5kbzEyMw==";
		let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb21haW4iOiIiLCJleHAiOjE0NjQwMjM2NjcsImlzcyI6IkRvY3VtaXplIiwib3JnIjoiVnpNdXlFd18zV3FpYWZjRCIsInN1YiI6IndlYmFwcCIsInVzZXIiOiJWek11eUV3XzNXcWlhZmNFIn0.NXZ6bo8mtvdZF_b9HavbidVUJqhmBA1zr0fSAPvbah0";
		let user = schema.db.users.where({ id: "VzMuyEw_3WqiafcE" });

		if (expectedAuthorization === authorization) {
			return {
				"token": `${token}`,
				"user": user[0]
			};
		}

		if (expectedAuthorization !== authorization) {
			return new Mirage.Response(401, { 'Content-Type': 'application/json' }, { message: 'Bad Request' });
		}

		return {
			"token": `${token}`,
			"user": user[0]
		};

	});

	this.get('/users/:id/permissions', (schema, request) => {
		let userId = request.params.id;
		return schema.db.permissions.where({ userId: `${userId}` });
	});

	this.get('/folders/:id/permissions', (schema, request) => {
		let id = request.params.id;
		return schema.db.folderPermissions.where({ id: `${id}` });
	});

	this.put('/folders/:id/permissions', (schema, request) => {
		let id = request.params.id;
		let attrs = JSON.parse(request.requestBody).Roles;

		// return schema.db.folderPermissions.update(`${id}`, { `${attrs[0]}` });
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

	this.get('/organizations/VzMuyEw_3WqiafcD', (schema) => {
		return schema.db.organizations[0];
	});

	this.put('/organizations/VzMuyEw_3WqiafcD', (schema, request) => {
		let title = JSON.parse(request.requestBody).title;
		let message = JSON.parse(request.requestBody).title;
		let allowAnonymousAccess = JSON.parse(request.requestBody).allowAnonymousAccess;

		return schema.db.organizations.update('VzMuyEw_3WqiafcD', {
			title: `${title}`,
			message: `${message}`,
			allowAnonymousAccess: `${allowAnonymousAccess}`
		});
	});

	this.get('/users', (schema, request) => {
		return schema.db.users;
	});

	this.post('/users', (schema, request) => {
		let firstname = JSON.parse(request.requestBody).firstname;
		let lastname = JSON.parse(request.requestBody).lastname;
		let email = JSON.parse(request.requestBody).email;

		let user = {
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

		return schema.db.users.insert(user);
	});

	this.get('/users/:id', (schema, request) => {
		let id = request.params.id;
		let user = schema.db.users.where({ id: `${id}` });
		return user[0];
	});

	this.put('/users/VzMuyEw_3WqiafcE', (schema, request) => {
		let firstname = JSON.parse(request.requestBody).firstname;
		let lastname = JSON.parse(request.requestBody).lastname;
		let email = JSON.parse(request.requestBody).email;

		return schema.db.users.update('VzMuyEw_3WqiafcE', {
			firstname: `${firstname}`,
			lastname: `${lastname}`,
			email: `${email}`
		});
	});

	this.post('/folders/VzMuyEw_3WqiafcG/invitation', () => {
		return {};
	});

}
