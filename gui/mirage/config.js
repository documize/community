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

import Mirage from 'ember-cli-mirage';

export default function () {

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

		if (folder_id === "VzMuyEw_3WqiafcG") {
			return schema.db.documents.where({ folderId: folder_id });
		}

		if (folder_id === 'V0Vy5Uw_3QeDAMW9') {
			return null;
		}
	});

	this.get('/documents/:id', function (schema, request) {
		let id = request.params.id;
		return schema.db.documents.where({ id: `${id}` })[0];
	});

	this.get('/documents/:id/pages', function () {
		return [{
			"id": "VzMzBUw_3WrtFztw",
			"created": "2016-05-11T13:26:29Z",
			"revised": "2016-05-11T13:26:29Z",
			"orgId": "VzMuyEw_3WqiafcD",
			"documentId": "VzMzBUw_3WrtFztv",
			"userId": "VzMuyEw_3WqiafcE",
			"contentType": "wysiwyg",
			"level": 1,
			"sequence": 1024,
			"title": "README",
			"body": "",
			"revisions": 0
		}, {
			"id": "VzMzBUw_3WrtFztx",
			"created": "2016-05-11T13:26:29Z",
			"revised": "2016-05-11T13:26:29Z",
			"orgId": "VzMuyEw_3WqiafcD",
			"documentId": "VzMzBUw_3WrtFztv",
			"userId": "VzMuyEw_3WqiafcE",
			"contentType": "wysiwyg",
			"level": 2,
			"sequence": 2048,
			"title": "To Document / Instructions ",
			"body": "\n\n\u003cp\u003eThe build process around go get github.com/elazarl/go-bindata-assetfs\u003c/p\u003e\n\n",
			"revisions": 0
		}, {
			"id": "VzMzBUw_3WrtFzty",
			"created": "2016-05-11T13:26:29Z",
			"revised": "2016-05-11T13:26:29Z",
			"orgId": "VzMuyEw_3WqiafcD",
			"documentId": "VzMzBUw_3WrtFztv",
			"userId": "VzMuyEw_3WqiafcE",
			"contentType": "wysiwyg",
			"level": 3,
			"sequence": 3072,
			"title": "GO ",
			"body": "\n\n\u003cp\u003egobin / go env\u003c/p\u003e\n\n",
			"revisions": 0
		}, {
			"id": "VzMzBUw_3WrtFztz",
			"created": "2016-05-11T13:26:29Z",
			"revised": "2016-05-11T13:26:29Z",
			"orgId": "VzMuyEw_3WqiafcD",
			"documentId": "VzMzBUw_3WrtFztv",
			"userId": "VzMuyEw_3WqiafcE",
			"contentType": "wysiwyg",
			"level": 3,
			"sequence": 4096,
			"title": "go-bindata-assetsfs ",
			"body": "\n\n\u003cp\u003emake sure you do install cmd from inside go-* folder where main.go lives\u003c/p\u003e\n\n",
			"revisions": 0
		}, {
			"id": "VzMzBUw_3WrtFzt0",
			"created": "2016-05-11T13:26:29Z",
			"revised": "2016-05-11T13:26:29Z",
			"orgId": "VzMuyEw_3WqiafcD",
			"documentId": "VzMzBUw_3WrtFztv",
			"userId": "VzMuyEw_3WqiafcE",
			"contentType": "wysiwyg",
			"level": 3,
			"sequence": 5120,
			"title": "SSL ",
			"body": "\n\n\u003cp\u003eselfcert generation and avoiding red lock\u003c/p\u003e\n\n\u003cp\u003e\u003ca href=\"https://www.accuweaver.com/2014/09/19/make-chrome-accept-a-self-signed-certificate-on-osx/\"\u003ehttps://www.accuweaver.com/2014/09/19/make-chrome-accept-a-self-signed-certificate-on-osx/\u003c/a\u003e\u003c/p\u003e\n\n\u003cp\u003echrome://restart\u003c/p\u003e\n\n\u003cp\u003ego run generate_cert.go -host demo1.dev\u003c/p\u003e\n\n\u003cp\u003eport number not required\nbut browser restart is!\u003c/p\u003e\n\n",
			"revisions": 0
		}, {
			"id": "VzMzBUw_3WrtFzt1",
			"created": "2016-05-11T13:26:29Z",
			"revised": "2016-05-11T13:26:29Z",
			"orgId": "VzMuyEw_3WqiafcD",
			"documentId": "VzMzBUw_3WrtFztv",
			"userId": "VzMuyEw_3WqiafcE",
			"contentType": "wysiwyg",
			"level": 3,
			"sequence": 6144,
			"title": "after clone ",
			"body": "\n\n\u003cul\u003e\n\u003cli\u003ecd app\u003c/li\u003e\n\u003cli\u003enpm install\u003c/li\u003e\n\u003cli\u003ebower install\u003c/li\u003e\n\u003cli\u003ecd ..\u003c/li\u003e\n\u003cli\u003e./build.sh\u003c/li\u003e\n\u003c/ul\u003e\n",
			"revisions": 0
		}, {
			"id": "V1qnNUw_3QRDs13j",
			"created": "2016-06-10T11:40:37Z",
			"revised": "2016-06-10T11:40:37Z",
			"orgId": "VzMuyEw_3WqiafcD",
			"documentId": "VzMzBUw_3WrtFztv",
			"userId": "VzMuyEw_3WqiafcE",
			"contentType": "github",
			"level": 2,
			"sequence": 12288,
			"title": "GitHub Section",
			"body": "\n\u003cdiv class=\"section-github-render\"\u003e\n\t\u003cp\u003eThere are 0 commits for branch \u003ca href=\"\"\u003e\u003c/a\u003e of repository \u003ca href=\"\"\u003e.\u003c/a\u003e\u003c/p\u003e\n\t\u003cdiv class=\"github-board\"\u003e\n\t\t\n\t\u003c/div\u003e\n\u003c/div\u003e\n",
			"revisions": 0
		}, {
			"id": "V1qqJkw_3RXs3w1D",
			"created": "2016-06-10T11:53:10Z",
			"revised": "2016-06-10T11:53:10Z",
			"orgId": "VzMuyEw_3WqiafcD",
			"documentId": "VzMzBUw_3WrtFztv",
			"userId": "VzMuyEw_3WqiafcE",
			"contentType": "github",
			"level": 2,
			"sequence": 24576,
			"title": "GitHub Section",
			"body": "\n\u003cdiv class=\"section-github-render\"\u003e\n\t\u003cp\u003eThere are 0 commits for branch \u003ca href=\"\"\u003e\u003c/a\u003e of repository \u003ca href=\"\"\u003e.\u003c/a\u003e\u003c/p\u003e\n\t\u003cdiv class=\"github-board\"\u003e\n\t\t\n\t\u003c/div\u003e\n\u003c/div\u003e\n",
			"revisions": 0
		}];
	});

	this.post('/templates/0/folder/VzMuyEw_3WqiafcG', function (schema, request) {
		let type = request.queryParams.type;
		if (type === 'saved') {
			return schema.db.documents.insert({
				"id": "V4y7jkw_3QvCDSeS",
				"created": "2016-07-18T11:20:47Z",
				"revised": "2016-07-18T11:20:47Z",
				"orgId": "VzMuyEw_3WqiafcD",
				"folderId": "VzMuyEw_3WqiafcG",
				"userId": "VzMuyEw_3WqiafcE",
				"job": "",
				"location": "template-0",
				"name": "New Document",
				"excerpt": "A new document",
				"tags": "",
				"template": false
			});
		}
	});

	this.delete('/documents/:id', function (schema, request) {
		let id = request.params.id;
		return schema.db.documents.remove(id);
	});

	this.get('/documents/:id/attachments', function () {
		return {};
	});

	this.get('/documents/:id/meta', function () {
		return {
			"viewers": [{
				"userId": "VzMuyEw_3WqiafcE",
				"created": "2016-07-14T13:46:24Z",
				"firstname": "Lennex",
				"lastname": "Zinyando"
			}],
			"editors": [{
				"pageId": "V1qqJkw_3RXs3w1D",
				"userId": "VzMuyEw_3WqiafcE",
				"action": "add-page",
				"created": "2016-06-10T11:53:10Z",
				"firstname": "Lennex",
				"lastname": "Zinyando"
			}, {
				"pageId": "V1qnNUw_3QRDs13j",
				"userId": "VzMuyEw_3WqiafcE",
				"action": "add-page",
				"created": "2016-06-10T11:40:37Z",
				"firstname": "Lennex",
				"lastname": "Zinyando"
			}, {
				"pageId": "VzMzBUw_3WrtFztw",
				"userId": "VzMuyEw_3WqiafcE",
				"action": "add-page",
				"created": "2016-05-11T13:26:29Z",
				"firstname": "Lennex",
				"lastname": "Zinyando"
			}, {
				"pageId": "VzMzBUw_3WrtFztx",
				"userId": "VzMuyEw_3WqiafcE",
				"action": "add-page",
				"created": "2016-05-11T13:26:29Z",
				"firstname": "Lennex",
				"lastname": "Zinyando"
			}, {
				"pageId": "VzMzBUw_3WrtFzty",
				"userId": "VzMuyEw_3WqiafcE",
				"action": "add-page",
				"created": "2016-05-11T13:26:29Z",
				"firstname": "Lennex",
				"lastname": "Zinyando"
			}, {
				"pageId": "VzMzBUw_3WrtFztz",
				"userId": "VzMuyEw_3WqiafcE",
				"action": "add-page",
				"created": "2016-05-11T13:26:29Z",
				"firstname": "Lennex",
				"lastname": "Zinyando"
			}, {
				"pageId": "VzMzBUw_3WrtFzt0",
				"userId": "VzMuyEw_3WqiafcE",
				"action": "add-page",
				"created": "2016-05-11T13:26:29Z",
				"firstname": "Lennex",
				"lastname": "Zinyando"
			}, {
				"pageId": "VzMzBUw_3WrtFzt1",
				"userId": "VzMuyEw_3WqiafcE",
				"action": "add-page",
				"created": "2016-05-11T13:26:29Z",
				"firstname": "Lennex",
				"lastname": "Zinyando"
			}]
		};
	});

	this.get('/folders', function (schema) {
		return schema.db.folders;
	});

	this.post('/folders', function (schema, request) {
		var name = JSON.parse(request.requestBody).name;
		let folder = {
			"id": "V0Vy5Uw_3QeDAMW9",
			"created": "2016-05-25T09:39:49Z",
			"revised": "2016-05-25T09:39:49Z",
			"name": name,
			"orgId": "VzMuyEw_3WqiafcD",
			"userId": "VzMuyEw_3WqiafcE",
			"spaceType": 2
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

	this.put('/folders/:id/permissions', () => {
		// let id = request.params.id;
		// let attrs = JSON.parse(request.requestBody).Roles;
		// return schema.db.folderPermissions.update('VzMygEw_3WrtFzto', attrs[0]);
	});

	this.get('/users/folder/:id', () => {
		return [{
			"id": "VzMuyEw_3WqiafcE",
			"created": "2016-05-11T15:08:24Z",
			"revised": "2016-07-04T10:24:41Z",
			"firstname": "Lennex",
			"lastname": "Zinyando",
			"email": "brizdigital@gmail.com",
			"initials": "LZ",
			"active": true,
			"editor": false,
			"admin": false,
			"accounts": null
		}];
	});

	this.get('/sections/refresh', (schema, request) => {
		let documentID = request.queryParams.documentID;
		if (documentID) {
			return {};
		}
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
			"spaceType": 2
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

	this.get('/users', (schema) => {
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
