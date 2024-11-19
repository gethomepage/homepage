---
title: ArgoCD
description: ArgoCD Widget Configuration
---

Learn more about [ArgoCD](https://argo-cd.readthedocs.io/en/stable/).

Allowed fields (limited to a max of 4): `["apps", "synced", "outOfSync", "healthy", "progressing", "degraded", "suspended", "missing"]`

```yaml
widget:
  type: argocd
  url: http://argocd.host.or.ip:port
  key: argocdapikey
```

You can generate an API key either by creating a bearer token for an existing account, see [Authorization](https://argo-cd.readthedocs.io/en/latest/developer-guide/api-docs/#authorization) (not recommended) or create a new local user account with limited privileges and generate an authentication token for this account. To do this the steps are:

- [Create a new local user](https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/#create-new-user) and give it the `apiKey` capability
- Setup [RBAC configuration](https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/#rbac-configuration) for your the user and give it readonly access to your ArgoCD resources, e.g. by giving it the `role:readonly` role.
- In your ArgoCD project under _Settings / Accounts_ open the newly created account and in the _Tokens_ section click on _Generate New_ to generate an access token, optionally specifying an expiry date.

If you installed ArgoCD via the official Helm chart, the account creation and rbac config can be achived by overriding these helm values:

```yaml
configs:
  cm:
    accounts.readonly: apiKey
  rbac:
    policy.csv: "g, readonly, role:readonly"
```

This creates a new account called `readonly` and attaches the `role:readonly` role to it.
