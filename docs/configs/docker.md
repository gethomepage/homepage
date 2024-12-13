---
title: Docker
description: Docker Configuration
---

Docker instances are configured inside the `docker.yaml` file. Both IP:PORT and Socket connections are supported.

For IP:PORT, simply make sure your Docker instance [has been configured](https://gist.github.com/styblope/dc55e0ad2a9848f2cc3307d4819d819f) to accept API traffic over the HTTP API.

```yaml
my-remote-docker:
  host: 192.168.0.101
  port: 2375
```

## Using Docker TLS

Since Docker supports connecting with TLS and client certificate authentication, you can include TLS details when connecting to the HTTP API. Further details of setting up Docker to accept TLS connections, and generation of the keys and certs can be found [in the Docker documentation](https://docs.docker.com/engine/security/protect-access/#use-tls-https-to-protect-the-docker-daemon-socket). The file entries are relative to the `config` directory (location of `docker.yaml` file).

```yaml
my-remote-docker:
  host: 192.168.0.101
  port: 275
  tls:
    keyFile: tls/key.pem
    caFile: tls/ca.pem
    certFile: tls/cert.pem
```

## Using Docker Socket Proxy

Due to security concerns with exposing the docker socket directly, you can use a [docker-socket-proxy](https://github.com/Tecnativa/docker-socket-proxy) container to expose the docker socket on a more restricted and secure API.

Here is an example docker-compose file that will expose the docker socket, and then connect to it from the homepage container:

```yaml
dockerproxy:
  image: ghcr.io/tecnativa/docker-socket-proxy:latest
  container_name: dockerproxy
  environment:
    - CONTAINERS=1 # Allow access to viewing containers
    - SERVICES=1 # Allow access to viewing services (necessary when using Docker Swarm)
    - TASKS=1 # Allow access to viewing tasks (necessary when using Docker Swarm)
    - POST=0 # Disallow any POST operations (effectively read-only)
  ports:
    - 127.0.0.1:2375:2375
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro # Mounted as read-only
  restart: unless-stopped

homepage:
  image: ghcr.io/gethomepage/homepage:latest
  container_name: homepage
  volumes:
    - /path/to/config:/app/config
  ports:
    - 3000:3000
  restart: unless-stopped
```

Then, inside of your `docker.yaml` settings file, you'd configure the docker instance like so:

```yaml
my-docker:
  host: dockerproxy
  port: 2375
```

## Using Socket Directly

If you'd rather use the socket directly, first make sure that you're passing the local socket into the Docker container.

!!! note

    In order to use the socket directly homepage must be running as root

```yaml
homepage:
  image: ghcr.io/gethomepage/homepage:latest
  container_name: homepage
  volumes:
    - /path/to/config:/app/config
    - /var/run/docker.sock:/var/run/docker.sock # pass local proxy
  ports:
    - 3000:3000
  restart: unless-stopped
```

If you're using `docker run`, this would be `-v /var/run/docker.sock:/var/run/docker.sock`.

Then, inside of your `docker.yaml` settings file, you'd configure the docker instance like so:

```yaml
my-docker:
  socket: /var/run/docker.sock
```

## Services

Once you've configured your docker instances, you can then apply them to your services, to get stats and status reporting shown.

Inside of the service you'd like to connect to docker:

```yaml
- Emby:
  icon: emby.png
  href: "http://emby.home/"
  description: Media server
  server: my-docker # The docker server that was configured
  container: emby # The name of the container you'd like to connect
```

## Automatic Service Discovery

Homepage features automatic service discovery for containers with the proper labels attached, all configuration options can be applied using dot notation, beginning with `homepage`.

Below is an example of the same service entry shown above, as docker labels.

```yaml
services:
  emby:
    image: lscr.io/linuxserver/emby:latest
    container_name: emby
    ports:
      - 8096:8096
    restart: unless-stopped
    labels:
      - homepage.group=Media
      - homepage.name=Emby
      - homepage.icon=emby.png
      - homepage.href=http://emby.home/
      - homepage.description=Media server
```

When your Docker instance has been properly configured, this service will be automatically discovered and added to your Homepage. **You do not need to specify the `server` or `container` values, as they will be automatically inferred.**

**When using docker swarm use _deploy/labels_**

## Widgets

You may also configure widgets, along with the standard service entry, again, using dot notation.

```yaml
labels:
  - homepage.group=Media
  - homepage.name=Emby
  - homepage.icon=emby.png
  - homepage.href=http://emby.home/
  - homepage.description=Media server
  - homepage.widget.type=emby
  - homepage.widget.url=http://emby.home
  - homepage.widget.key=yourembyapikeyhere
  - homepage.widget.fields=["field1","field2"] # optional
```

You can add specify fields for e.g. the [CustomAPI](../widgets/services/customapi.md) widget by using array-style dot notation:

```yaml
labels:
  - homepage.group=Media
  - homepage.name=Emby
  - homepage.icon=emby.png
  - homepage.href=http://emby.home/
  - homepage.description=Media server
  - homepage.widget.type=customapi
  - homepage.widget.url=http://argus.service/api/v1/service/summary/emby
  - homepage.widget.mappings[0].label=Deployed Version
  - homepage.widget.mappings[0].field.status=deployed_version
  - homepage.widget.mappings[1].label=Latest Version
  - homepage.widget.mappings[1].field.status=latest_version
```

## Docker Swarm

Docker swarm is supported and Docker services are specified with the same `server` and `container` notation. To enable swarm support you will need to include a `swarm` setting in your docker.yaml, e.g.

```yaml
my-docker:
  socket: /var/run/docker.sock
  swarm: true
```

For the automatic service discovery to discover all services it is important that homepage should be deployed on a manager node. Set deploy requirements to the master node in your stack yaml config, e.g.

```yaml
....
  deploy:
    placement:
      constraints:
        - node.role == manager
...
```

In order to detect every service within the Docker swarm it is necessary that service labels should be used and not container labels. Specify the homepage labels as:

```yaml
....
  deploy:
    labels:
      - homepage.icon=foobar
...
```

## Multiple Homepage Instances

The optional field `instanceName` can be configured in [settings.yaml](settings.md#instance-name) to differentiate between multiple homepage instances.

To limit a label to an instance, insert `.instance.{{instanceName}}` after the `homepage` prefix.

```yaml
labels:
  - homepage.group=Media
  - homepage.name=Emby
  - homepage.icon=emby.png
  - homepage.instance.internal.href=http://emby.lan/
  - homepage.instance.public.href=https://emby.mydomain.com/
  - homepage.description=Media server
```

## Ordering

As of v0.6.4 discovered services can include an optional `weight` field to determine sorting such that:

- Default weight for discovered services is 0
- Default weight for configured services is their index within their group scaled by 100, i.e. (index + 1) \* 100
- If two items have the same weight value, then they will be sorted by name

## Show stats

You can show the docker stats by clicking the status indicator but this can also be controlled per-service with:

```yaml
- Example Service:
  ...
  showStats: true
```

Also see the settings for [show docker stats](settings.md#show-docker-stats).
