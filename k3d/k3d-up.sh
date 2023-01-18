#!/bin/bash

k3d cluster create --config k3d.yaml --wait
k3d kubeconfig get homepage > kubeconfig
chmod 600 kubeconfig
export KUBECONFIG=$(pwd)/kubeconfig

echo "Waiting for traefik install job to complete (CTRL+C is safe if you're impatient)"
kubectl wait jobs/helm-install-traefik -n kube-system --for condition=complete --timeout 90s && echo "Completed" || echo "Timed out (but it should still come up eventually)"
