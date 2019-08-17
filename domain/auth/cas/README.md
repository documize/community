# Authenticating with Aperao CAS

## Introduction

Documize can delegate user authentication to aperao CAS integration.

This document assumes that the Documize administrator has installed and is familiar with CAS server.

https://www.apereo.org/projects/cas

Documize is tested against the CAS version 5.3.x.

## Configuring Documize

CAS authentication is configured and enabled from Settings.

Type in the CAS Server URL, Redirect URL.

* **CAS Server URL**: The CAS host address, eg: `https://cas.example.com`
* **Redirect URL**: The CAS authorize callback URL. If your documize URL is `https://example.documize.com,` then redirect URL is `https://example.documize.com/auth/cas`.

