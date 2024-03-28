---
title: Kubernetes Installation
description: Install on Kubernetes
---

## Install with Helm

There is an [unofficial helm chart](https://github.com/jameswynn/helm-charts/tree/main/charts/homepage) that creates all the necessary manifests, including the service account and RBAC entities necessary for service discovery.

```sh
helm repo add jameswynn https://jameswynn.github.io/helm-charts
helm install homepage jameswynn/homepage -f values.yaml
```

The helm chart allows for all the configurations to be inlined directly in your `values.yaml`:

```yaml
config:
  bookmarks:
    - Developer:
        - Github:
            - abbr: GH
              href: https://github.com/
  services:
    - My First Group:
        - My First Service:
            href: http://localhost/
            description: Homepage is awesome

    - My Second Group:
        - My Second Service:
            href: http://localhost/
            description: Homepage is the best

    - My Third Group:
        - My Third Service:
            href: http://localhost/
            description: Homepage is 😎
  widgets:
    # show the kubernetes widget, with the cluster summary and individual nodes
    - kubernetes:
        cluster:
          show: true
          cpu: true
          memory: true
          showLabel: true
          label: "cluster"
        nodes:
          show: true
          cpu: true
          memory: true
          showLabel: true
    - search:
        provider: duckduckgo
        target: _blank
  kubernetes:
    mode: cluster
  settings:

# The service account is necessary to allow discovery of other services
serviceAccount:
  create: true
  name: homepage

# This enables the service account to access the necessary resources
enableRbac: true

ingress:
  main:
    enabled: true
    annotations:
      # Example annotations to add Homepage to your Homepage!
      gethomepage.dev/enabled: "true"
      gethomepage.dev/name: "Homepage"
      gethomepage.dev/description: "Dynamically Detected Homepage"
      gethomepage.dev/group: "Dynamic"
      gethomepage.dev/icon: "homepage.png"
    hosts:
      - host: homepage.example.com
        paths:
          - path: /
            pathType: Prefix
```

## Install with Kubernetes Manifests

If you don't want to use the unofficial Helm chart, you can also create your own Kubernetes manifest(s) and apply them with `kubectl apply -f filename.yaml`.

Here's a working example of the resources you need:

#### ServiceAccount

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: homepage
  namespace: default
  labels:
    app.kubernetes.io/name: homepage
secrets:
  - name: homepage
```

#### Secret

```yaml
apiVersion: v1
kind: Secret
type: kubernetes.io/service-account-token
metadata:
  name: homepage
  namespace: default
  labels:
    app.kubernetes.io/name: homepage
  annotations:
    kubernetes.io/service-account.name: homepage
```

#### ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: homepage
  namespace: default
  labels:
    app.kubernetes.io/name: homepage
data:
  kubernetes.yaml: |
    mode: cluster
  settings.yaml: ""
  #settings.yaml: |
  #  providers:
  #    longhorn:
  #      url: https://longhorn.my.network
  custom.css: ""
  custom.js: ""
  bookmarks.yaml: |
    - Developer:
        - Github:
            - abbr: GH
              href: https://github.com/
  services.yaml: |
    - My First Group:
        - My First Service:
            href: http://localhost/
            description: Homepage is awesome

    - My Second Group:
        - My Second Service:
            href: http://localhost/
            description: Homepage is the best

    - My Third Group:
        - My Third Service:
            href: http://localhost/
            description: Homepage is 😎
  widgets.yaml: |
    - kubernetes:
        cluster:
          show: true
          cpu: true
          memory: true
          showLabel: true
          label: "cluster"
        nodes:
          show: true
          cpu: true
          memory: true
          showLabel: true
    - resources:
        backend: resources
        expanded: true
        cpu: true
        memory: true
    - search:
        provider: duckduckgo
        target: _blank
  docker.yaml: ""
```

#### ClusterRole and ClusterRoleBinding

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: homepage
  labels:
    app.kubernetes.io/name: homepage
rules:
  - apiGroups:
      - ""
    resources:
      - namespaces
      - pods
      - nodes
    verbs:
      - get
      - list
  - apiGroups:
      - extensions
      - networking.k8s.io
    resources:
      - ingresses
    verbs:
      - get
      - list
  - apiGroups:
      - traefik.containo.us
    resources:
      - ingressroutes
    verbs:
      - get
      - list
  - apiGroups:
      - metrics.k8s.io
    resources:
      - nodes
      - pods
    verbs:
      - get
      - list
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: homepage
  labels:
    app.kubernetes.io/name: homepage
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: homepage
subjects:
  - kind: ServiceAccount
    name: homepage
    namespace: default
```

#### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: homepage
  namespace: default
  labels:
    app.kubernetes.io/name: homepage
  annotations:
spec:
  type: ClusterIP
  ports:
    - port: 3000
      targetPort: http
      protocol: TCP
      name: http
  selector:
    app.kubernetes.io/name: homepage
```

#### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: homepage
  namespace: default
  labels:
    app.kubernetes.io/name: homepage
spec:
  revisionHistoryLimit: 3
  replicas: 1
  strategy:
    type: RollingUpdate
  selector:
    matchLabels:
      app.kubernetes.io/name: homepage
  template:
    metadata:
      labels:
        app.kubernetes.io/name: homepage
    spec:
      serviceAccountName: homepage
      automountServiceAccountToken: true
      dnsPolicy: ClusterFirst
      enableServiceLinks: true
      containers:
        - name: homepage
          image: "ghcr.io/gethomepage/homepage:latest"
          imagePullPolicy: Always
          ports:
            - name: http
              containerPort: 3000
              protocol: TCP
          volumeMounts:
            - mountPath: /app/config/custom.js
              name: homepage-config
              subPath: custom.js
            - mountPath: /app/config/custom.css
              name: homepage-config
              subPath: custom.css
            - mountPath: /app/config/bookmarks.yaml
              name: homepage-config
              subPath: bookmarks.yaml
            - mountPath: /app/config/docker.yaml
              name: homepage-config
              subPath: docker.yaml
            - mountPath: /app/config/kubernetes.yaml
              name: homepage-config
              subPath: kubernetes.yaml
            - mountPath: /app/config/services.yaml
              name: homepage-config
              subPath: services.yaml
            - mountPath: /app/config/settings.yaml
              name: homepage-config
              subPath: settings.yaml
            - mountPath: /app/config/widgets.yaml
              name: homepage-config
              subPath: widgets.yaml
            - mountPath: /app/config/logs
              name: logs
      volumes:
        - name: homepage-config
          configMap:
            name: homepage
        - name: logs
          emptyDir: {}
```

#### Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: homepage
  namespace: default
  labels:
    app.kubernetes.io/name: homepage
  annotations:
    gethomepage.dev/description: Dynamically Detected Homepage
    gethomepage.dev/enabled: "true"
    gethomepage.dev/group: Cluster Management
    gethomepage.dev/icon: homepage.png
    gethomepage.dev/name: Homepage
spec:
  rules:
    - host: "homepage.my.network"
      http:
        paths:
          - path: "/"
            pathType: Prefix
            backend:
              service:
                name: homepage
                port:
                  number: 3000
```

### Multiple Replicas

If you plan to deploy homepage with a replica count greater than 1, you may
want to consider enabling sticky sessions on the homepage route. This will
prevent unnecessary re-renders on page loads and window / tab focusing. The
procedure for enabling sticky sessions depends on your Ingress controller. Below
is an example using Traefik as the Ingress controller.

```
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: homepage.example.com
spec:
  entryPoints:
    - websecure
  routes:
    - kind: Rule
      match: Host(`homepage.example.com`)
      services:
        - kind: Service
          name: homepage
          port: 3000
          sticky:
            cookie:
              httpOnly: true
              secure: true
              sameSite: none
```
