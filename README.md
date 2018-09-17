> We're committed to providing frequent product releases to ensure self-host customers enjoy the same product as our cloud/SaaS customers.
>
> Harvey Kandola, CEO & Founder, Documize Inc.

## The mission

To bring software development inspired features to the world of documenting -- refactoring, importing, testing, linting, metrics, PRs, versioning....

## What is it?

Documize is an intelligent document environment (IDE) for authoring, tracking and delivering documentation -- everything you need in one place.

## Why should I care?

Because maybe like us you're tired of:

* juggling WYSIWYG editors, wiki software and other document related solutions
* playing email tennis with documents, contributions, versions and feedback
* sharing not-so-secure folders with external participants

Sound familiar? Read on.

## Who is it for?

Anyone who wants a single place for any kind of document.

Anyone who wants to loop in external participants with complete security.

Anyone who wishes documentation and knowledge capture worked like agile software development.

Anyone who knows that nested folders fail miserably.

Anyone who wants to move on from wiki software.

## What's different about Documize?

Sane organization through personal, team and public spaces.

Granular document access control via categories.

Section based approach to document construction.

Reusable templates and content blocks.

Documentation related tasking and delegation.

Integrations for embedding SaaS data within documents, zero add-on/marketplace fees.

## What does it look like?

All spaces.

![Documize](screenshot-1.png "Documize")

Space view.

![Documize](screenshot-2.png "Documize")

## Latest version

[Community edition: v1.70.0](https://github.com/documize/community/releases)

[Enterprise edition: v1.72.0](https://documize.com/downloads)

#### Update to latest comunity version automatically in Linux

```
#!/bin/bash

# Requires:
- curl
- wget 
- A service for documize

VERSION="$(curl -s https://api.github.com/repos/documize/community/releases | grep 'tag_name' | cut -d\" -f4 | head -1)"

service documize stop
rm -f /bin/documize-community-linux-amd64
if wget https://github.com/documize/community/releases/download/$VERSION/documize-community-linux-amd64 -P /bin/
then
    chmod +x /bin/documize-community-linux-amd64
    echo "Rebooting in 5 seconds..."
    echo "5"
    sleep 1
    echo "4"
    sleep 1
    echo "3"
    sleep 1
    echo "2"
    sleep 1
    echo "1"
    sleep 1
    reboot
fi
```

## OS support

Documize runs on the following:

- Linux
- Windows
- macOS

# Browser support

Documize supports the following (evergreen) browsers:

- Chrome
- Firefox
- Safari
- Brave
- MS Edge (16+)

## Technology stack

Documize is built with the following technologies:

- EmberJS (v3.1.2)
- Go (v1.10.3)

...and supports the following databases:

- MySQL (v5.7.10+)
- Percona (v5.7.16-10+)
- MariaDB (10.3.0+)

Coming soon, PostgreSQL and Microsoft SQL Server database support.

## Authentication options

Besides email/password login, you can also leverage the following options.

### LDAP / Active Directory

Connect and sync Documize with any LDAP v3 compliant provider including Microsoft Active Directory.

### Keycloak Integration

Documize provides out-of-the-box integration with [Redhat Keycloak](http://www.keycloak.org) for open source identity and access management.

Connect and authenticate with LDAP, Active Directory and more.

<https://docs.documize.com>

### Auth0 Compatible

Documize is compatible with Auth0 identity as a service.

[![JWT Auth for open source projects](https://cdn.auth0.com/oss/badges/a0-badge-dark.png)](https://auth0.com/?utm_source=oss&utm_medium=gp&utm_campaign=oss)

Open Source Identity and Access Management

## Developer's Note

We try to follow sound advice when writing commit messages:

https://chris.beams.io/posts/git-commit/

## The legal bit

<https://documize.com>

This software (Documize Community Edition) is licensed under GNU AGPL v3 <http://www.gnu.org/licenses/agpl-3.0.en.html>. You can operate outside the AGPL restrictions by purchasing Documize Enterprise Edition and obtaining a commercial license by contacting <sales@documize.com>. Documize® is a registered trade mark of Documize Inc.
