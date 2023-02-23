# Homepage (benphelps)

A modern (fully static, fast), secure (fully proxied), highly customizable application dashboard with integrations for more than 25 services and translations for over 15 languages. Easily configured via YAML files (or discovery via docker labels).

[Homepage](https://github.com/benphelps/homepage)

## TL;DR

```bash
helm repo add homepage http://benphelps.github.io/homepage
helm install my-release homepage/homepage
```

## Introduction

This chart bootstraps a [Homepage](https://github.com/benphelps/homepage) deployment on a [Kubernetes](https://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+

## Installing the Chart

To install the chart with the release name `my-release`:

```bash
helm install my-release homepage/homepage
```

The command deploys Homepage on the Kubernetes cluster in the default configuration. The [Parameters](#parameters) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall/delete the `my-release` deployment:

```console
helm delete my-release
```

## Parameters

This chart is based on [bjw-s library](https://bjw-s.github.io/helm-charts/docs/common-library/introduction/) and
shares many configuration options with its derived [app-template](https://bjw-s.github.io/helm-charts/docs/app-template/introduction/).

See the [values files](values.yaml) for more examples.
