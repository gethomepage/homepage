---
title: Azure DevOps
description: Azure DevOps Widget Configuration
---

Learn more about [Azure DevOps](https://azure.microsoft.com/en-us/products/devops).

This widget has 2 functions:

1. Pipelines: checks if the relevant pipeline is running or not, and if not, reports the last status.\
   Allowed fields: `["result", "status"]`.

2. Pull Requests: returns the amount of open PRs, the amount of the PRs you have open, and how many PRs that you open are marked as 'Approved' by at least 1 person and not yet completed.\
   Allowed fields: `["totalPrs", "myPrs", "approved"]`.

You will need to generate a personal access token for an existing user, see the [azure documentation](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows#create-a-pat)

```yaml
widget:
  type: azuredevops
  organization: myOrganization
  project: myProject
  definitionId: pipelineDefinitionId # required for pipelines
  branchName: branchName # optional for pipelines, leave empty for all
  userEmail: email # required for pull requests
  repositoryId: prRepositoryId # required for pull requests
  key: personalaccesstoken
```
