---
title: Installation
description: Docs intro
icon: simple/docker
---

You have a few options for deploying homepage, depending on your needs. We offer docker images for a majority of platforms. You can also install and run homepage from source if Docker is not your thing. It can even be installed on Kubernetes with Helm.

!!! info

    Please note that when using features such as widgets, Homepage can access personal information (for example from your home automation system) and Homepage currently does not (and is not planned to) include any authentication layer itself. Thus, we recommend homepage be deployed behind a reverse proxy including authentication, SSL etc, and / or behind a VPN.

<br>

<div class="grid cards" style="margin: 0 auto;" markdown>
[:simple-docker: &nbsp; Install on Docker :octicons-arrow-right-24:](docker.md)
{ .card }

[:simple-kubernetes: &nbsp; Install on Kubernetes :octicons-arrow-right-24:](k8s.md)
{ .card }

[:simple-unraid: &nbsp; Install on UNRAID :octicons-arrow-right-24:](unraid.md)
{ .card }

[:simple-nextdotjs: &nbsp; Building from source :octicons-arrow-right-24:](source.md)
{ .card }

</div>

### Security & Authentication

Public deployments of Homepage should be secured via a reverse proxy, VPN, or similar. As of version 2.0, Homepage supports a simple authorization gate with a password or OIDC. When enabled, Homepage will use password login by default unless OIDC variables are provided.

Required environment variables for authentication:

- `HOMEPAGE_AUTH_ENABLED=true`
- `HOMEPAGE_AUTH_SECRET` (random string for signing/encrypting cookies)

For password-only login:

- `HOMEPAGE_AUTH_PASSWORD` (password-only login; required unless OIDC settings are provided)

For OIDC login (overrides password login):

- `HOMEPAGE_OIDC_ISSUER` (OIDC issuer URL, e.g., `https://auth.example.com/realms/homepage`)
- `HOMEPAGE_OIDC_CLIENT_ID`
- `HOMEPAGE_OIDC_CLIENT_SECRET`
- `HOMEPAGE_EXTERNAL_URL` (external URL to your Homepage instance; used for callbacks)
- Optional: `HOMEPAGE_OIDC_NAME` (display name), `HOMEPAGE_OIDC_SCOPE` (defaults to `openid email profile`)

All app pages and `/api` routes will require a signed-in session. Static assets remain public. Homepage still does not implement per-user dashboards or roles; authentication is a simple gate only.
