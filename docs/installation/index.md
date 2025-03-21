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

### `HOMEPAGE_ALLOWED_HOSTS`

As of v1.0 there is one required environment variable to access homepage via a URL other than `localhost`, <code>HOMEPAGE_ALLOWED_HOSTS</code>. The setting helps prevent certain kinds of attacks when retrieving data from the homepage API proxy.

The value is a comma-separated (no spaces) list of allowed hosts (sometimes with the port) that can host your homepage install. See the [docker](docker.md), [kubernetes](k8s.md) and [source](source.md) installation pages for more information about where / how to set the variable.

`localhost:3000` and `127.0.0.1:3000` are always included, but you can add a domain or IP address to this list to allow that host such as `HOMEPAGE_ALLOWED_HOSTS=gethomepage.dev,192.168.1.2:1234`, etc.

If you are seeing errors about host validation, check the homepage logs and ensure that the host exactly as output in the logs is in the `HOMEPAGE_ALLOWED_HOSTS` list.

This can be disabled by setting `HOMEPAGE_ALLOWED_HOSTS` to `*` but this is not recommended.
