Documize Community is an open source, self-hosted, modern, lightweight alternative to Confluence and other similar solutions.

- Built for technical and non-technical users
- Designed to unify both customer-facing and internal documentation
- Organization through labels, spaces and categories

It's built with Golang + EmberJS and compiled down to a single executable binary that is available for Linux, Windows and Mac.

All you need to provide is your database -- PostgreSQL, Microsoft SQL Server or any MySQL variant.

![Documize Community](https://github.com/documize/community/blob/master/screenshot.png?raw=true)

## Latest Release

[Community edition: v5.4.2](https://github.com/documize/community/releases)

[Community+ edition: v5.4.2](https://www.documize.com/community/get-started)

The Community+ edition is the "enterprise" offering with advanced capabilities and customer support:

- content approval workflows
- content organization by label, space and category
- content version management
- content lifecycle management
- content feedback capture
- content PDF export
- analytics and reporting
- activity streams
- audit logs
- actions assignments
- product support

The Community+ edition is [free](https://www.documize.com/community/get-started) for the first five users -- thereafter pricing starts at just $900 annually for 100 users.

## OS Support

- Linux
- Windows
- macOS
- Raspberry Pi (ARM build)

Support for AMD and ARM 64 bit architectures.

## Database Support

For all database types, Full-Text Search support (FTS) is mandatory.

- PostgreSQL (v9.6+)
- Microsoft SQL Server (2016+ with FTS)
- MySQL (v5.7.10+ and v8.0.12+)
- Percona (v5.7.16-10+)
- MariaDB (10.3.0+)

## Browser Support

- Firefox
- Chrome
- Safari
- Microsoft Edge (v42+)
- Brave
- Vivaldi
- Opera

## Technology Stack

- Go (v1.19.2)
- Ember JS (v3.12.0)

## Authentication Options

Besides email/password login, you can also authenticate via:

* LDAP
* Active Directory
* Red Hat Keycloak
* Central Authentication Service (CAS)

When using LDAP/Active Directory, you can enable dual-authentication with email/password.

## Localization

Languages supported out-of-the-box:

- English
- German
- Chinese (中文)
- Portuguese (Brazil) (Português - Brasil)

PR's welcome for additional languages.

## Product/Technical Support

For both Community and Community+ editions, please contact our help desk for product help, suggestions and other enquiries.

<support@documize.com>

We aim to respond within two working days.

## The Legal Bit

<https://www.documize.com>

This software (Documize Community Edition) is licensed under GNU AGPL v3 <http://www.gnu.org/licenses/agpl-3.0.en.html>.

Documize uses other open source components and we acknowledge them in [NOTICES](NOTICES.md)
