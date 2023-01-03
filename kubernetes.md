# Kubernetes Support

## Requirements

* Kubernetes 1.19+
* Metrics service
* An Ingress controller

## Deployment

Use the unofficial helm chart: https://github.com/jameswynn/helm-charts/tree/main/charts/homepage

```sh
helm repo add jameswynn https://jameswynn.github.io/helm-charts
helm install my-release jameswynn/homepage
```

### Configuration

Set the `mode` in the `kubernetes.yaml` to `cluster`.

```yaml
mode: default
```

## Widgets

The Kubernetes widget can show a high-level overview of the cluster,
individual nodes, or both.

```yaml
- kubernetes:
    cluster:
      # Shows the cluster node
      show: true
      # Shows the aggregate CPU stats
      cpu: true
      # Shows the aggregate memory stats
      memory: true
      # Shows a custom label
      showLabel: true
      label: "cluster"
    nodes:
      # Shows the clusters
      show: true
      # Shows the CPU for each node
      cpu: true
      # Shows the memory for each node
      memory: true
      # Shows the label, which is always the node name
      showLabel: true
```

## Service Discovery

Sample yaml:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: homepage
  annotations:
    gethomepage.dev/enabled: "true"
    gethomepage.dev/description: Dynamically Detected Homepage
    gethomepage.dev/group: Operations
    gethomepage.dev/icon: homepage.png
    gethomepage.dev/name: Homepage
spec:
  rules:
    - host: homepage.example.com
      http:
        paths:
          - backend:
              service:
                name: homepage
                port:
                  number: 3000
            path: /
            pathType: Prefix
```

## Service Widgets

To manually configure a Service Widget the `namespace` and `app` fields must
be configured on the service entry.

```yaml
- Home Automation
    - Home-Assistant:
        icon: home-assistant.png
        href: https://home.example.com
        description: Home Automation
        app: home-assistant
        namespace: home
```

This works by creating a label selector `app.kubernetes.io/name=home-assistant`,
which typically will be the same both for the ingress and the deployment. However,
some deployments can be complex and will not conform to this rule. In such
cases the `podSelector` variable can bridge the gap. Any field selector can
be used in it which allows for some powerful selection capabilities.

For instance, it can be utilized to roll multiple underlying deployments under
one application to see a high-level aggregate:

```yaml
- Comms
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

## Longhorn Widget

There is a widget for showing storage stats from [Longhorn](https://longhorn.io).
Configure it from the `widgets.yaml`.

```yaml
- longhorn:
    # Show the expanded
    expanded: true
    # Shows a node representing the aggregate values
    total: true
    # Shows the node names as labels
    labels: true
    # Show the nodes
    nodes: true
    # An explicit list of nodes to show. All are shown by default if "nodes" is true
    include:
      - node1
      - node2
```
