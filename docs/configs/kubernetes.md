---
title: Kubernetes
description: Kubernetes Configuration
---

The Kubernetes connectivity has the following requirements:

- Kubernetes 1.19+
- Metrics Service
- An Ingress controller

The Kubernetes connection is configured in the `kubernetes.yaml` file. There are 3 modes to choose from:

- **disabled** - disables kubernetes connectivity
- **default** - uses the default kubeconfig [resolution](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/)
- **cluster** - uses a service account inside the cluster

```yaml
mode: default
```

## Services

Once the Kubernetes connection is configured, individual services can be configured to pull statistics. Only CPU and Memory are currently supported.

Inside of the service you'd like to connect to a pod:

```yaml
- Emby:
  icon: emby.png
  href: "http://emby.home/"
  description: Media server
  namespace: media # The kubernetes namespace the app resides in
  app: emby # The name of the deployed app
```

The `app` field is used to create a label selector, in this example case it would match pods with the label: `app.kubernetes.io/name=emby`.

Sometimes this is insufficient for complex or atypical application deployments. In these cases, the `podSelector` field can be used. Any field selector can be used with it, so it allows for some very powerful selection capabilities.

For instance, it can be utilized to roll multiple underlying deployments under one application to see a high-level aggregate:

```yaml
- Element Chat:
    icon: matrix-light.png
    href: https://chat.example.com
    description: Matrix Synapse Powered Chat
    app: matrix-element
    namespace: comms
    podSelector: >-
      app.kubernetes.io/instance in (
          matrix-element,
          matrix-media-repo,
          matrix-media-repo-postgresql,
          matrix-synapse
      )
```

!!! note

    A blank string as a podSelector does not deactivate it, but will actually select all pods in the namespace. This is a useful way to capture the resource usage of a complex application siloed to a single namespace, like Longhorn.

## Automatic Service Discovery

Homepage features automatic service discovery by Ingress annotations. All configuration options can be applied using typical annotation syntax, beginning with `gethomepage.dev/`.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: emby
  annotations:
    gethomepage.dev/enabled: "true"
    gethomepage.dev/description: Media Server
    gethomepage.dev/group: Media
    gethomepage.dev/icon: emby.png
    gethomepage.dev/name: Emby
    gethomepage.dev/widget.type: "emby"
    gethomepage.dev/widget.url: "https://emby.example.com"
    gethomepage.dev/pod-selector: ""
    gethomepage.dev/weight: 10 # optional
    gethomepage.dev/instance: "public" # optional
spec:
  rules:
    - host: emby.example.com
      http:
        paths:
          - backend:
              service:
                name: emby
                port:
                  number: 8080
            path: /
            pathType: Prefix
```

When the Kubernetes cluster connection has been properly configured, this service will be automatically discovered and added to your Homepage. **You do not need to specify the `namespace` or `app` values, as they will be automatically inferred.**

If you are using multiple instances of homepage, an `instance` annotation can be specified to limit services to a specific instance. If no instance is provided, the service will be visible on all instances.

If you have a single service that needs to be shown on multiple specific instances of homepage (but not on all of them), the service can be annotated by multiple `instance.name` annotations, where `name` can be the names of your specific multiple homepage instances. For example, a service that is annotated with `gethomepage.dev/instance.public: ""` and `gethomepage.dev/instance.internal: ""` will be shown on `public` and `internal` homepage instances.

### Traefik IngressRoute support

Homepage can also read ingresses defined using the Traefik IngressRoute custom resource definition. Due to the complex nature of Traefik routing rules, it is required for the `gethomepage.dev/href` annotation to be set:

```yaml
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: emby
  annotations:
    gethomepage.dev/href: "https://emby.example.com"
    gethomepage.dev/enabled: "true"
    gethomepage.dev/description: Media Server
    gethomepage.dev/group: Media
    gethomepage.dev/icon: emby.png
    gethomepage.dev/app: emby-app # optional, may be needed if app.kubernetes.io/name != ingress metadata.name
    gethomepage.dev/name: Emby
    gethomepage.dev/widget.type: "emby"
    gethomepage.dev/widget.url: "https://emby.example.com"
    gethomepage.dev/pod-selector: ""
    gethomepage.dev/weight: 10 # optional
    gethomepage.dev/instance: "public" # optional
spec:
  entryPoints:
    - websecure
  routes:
    - kind: Rule
      match: Host(`emby.example.com`)
      services:
        - kind: Service
          name: emby
          namespace: emby
          port: 8080
          scheme: http
          strategy: RoundRobin
          weight: 10
```

If the `href` attribute is not present, Homepage will ignore the specific IngressRoute.

## Caveats

Similarly to Docker service discovery, there currently is no rigid ordering to discovered services and discovered services will be displayed above those specified in the `services.yaml`.

## CRDs

Homepage also comes with Kubernetes CRDs for services. These CRDs have same structure and properties as regular service YAML definition, with added properties of `group`, `weight`, `podSelector` and `instances`, used as described above. 

Compared to annotations, CRD approach can use Kubernetes secrets and configMaps to populate attributes of the `widget` object. To do this, instead of using the name, ex. `key`, use `keyFrom`, to match kubernetes standards. Then use either `secretKeyRef` or `configMapKeyRef` object, see example:

```yaml
apiVersion: gethomepage.dev/v1
kind: HomepageService
metadata:
  labels:
    app.kubernetes.io/instance: sonarr
  name: sonarr
  namespace: media
spec:
  description: TV Show Management Application
  group: Media
  href: 'https://sonarr.example.org/'
  icon: sonarr.svg
  widget:
    type: sonarr
    url: 'http://sonarr.media.svc.cluster.local:8989'
    keyFrom:
      secretKeyRef:
        key: SONARR_API_KEY
        name: arr-secrets
```

Some attributes have values inferred from the definition itself, `app` is read from *app.kubernetes.io/name* annotation or metadata.name, namespace is also read from metadata.

For secrets and configMaps, if `namespace` is not specified in ref object, it assumes it's in the same namespace as CRD. If you want to specify a default namespace (for example for security reason when assigning secrets:read permission for only one namespace), you can specify `defaultSecretNamespace` and `defaultConfigMapNamespace` in `kubernetes.yaml` file.

```yaml
---
mode: cluster
defaultSecretNamespace: homepage
```