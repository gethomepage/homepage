# Kubernetes Development

These configs and scripts attempt to simplify spinning up a kubernetes cluster
for development and testing purposes. It leverages [k3d](https://k3d.io) to create
a [k3s](https://k3s.io) cluster in Docker. Homepage can then be deployed either via
the `k3d-deploy.sh` script, or [tilt](https://tilt.dev) can be used to spin up a
local CI loop that will automatically update the deployment.

All the commands in the document should be run from the `k3d` directory.

## Requisite Tools

| Tool                                                        | Description                                              |
|-------------------------------------------------------------|----------------------------------------------------------|
| [docker](https://docker.io)                                 | Docker container runtime                                 |
| [kubectl](https://kubernetes.io/releases/download/#kubectl) | Kubernetes CLI                                           |
| [helm](https://helm.sh)                                     | Kubernetes package manager                               |
| [k3d](https://k3d.io)                                       | Kubernetes on Docker - used to create the cluster        |
| [k9s](https://k9scli.io)                                    | (Optional) Command line view for kubernetes cluster      |
| [tilt](https://tilt.dev)                                    | (Optional) Local CI loop for kubernetes deployment       |
| [direnv](https://direnv.net/)                               | (Optional) Automatically loads `kubeconfig` via `.envrc` |


## One-off Test Deployments

Create a cluster:

```sh
./k3d-up.sh
```

Build and deploy:

```sh
./k3d-deploy.sh
```

Open the Homepage deployment:

```sh
xdg-open http://homepage.k3d.localhost:8080/
```

## Continuous Deployment

Create a cluster:

```sh
./k3d-up.sh
```

Kick off tilt:

```sh
tilt up
```

Press space bar to open the tilt web UI, which is quite informative.

Open the Homepage deployment:

```sh
xdg-open http://homepage.k3d.localhost:8080/
```
