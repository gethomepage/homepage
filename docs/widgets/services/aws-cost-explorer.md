---
title: AWS Cost Explorer
description: AWS Cost Explorer Widget Configuration
---

Displays your current month-to-date (MTD) AWS spend using the [AWS Cost Explorer API](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-api.html).

## Configuration

Create a dedicated IAM user with the minimum required policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ce:GetCostAndUsage",
      "Resource": "*"
    }
  ]
}
```

Then add the widget to your `services.yaml`. Quote the credential values to avoid YAML parsing issues with special characters:

```yaml
- Cloud:
    - AWS Costs:
        icon: aws.svg
        href: https://console.aws.amazon.com/cost-management/home
        description: Month-to-date spend
        widget:
          type: awscostexplorer
          accessKeyId: "AKIAIOSFODNN7EXAMPLE"
          secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
          region: us-east-1 # optional, defaults to us-east-1
```

Allowed fields: no configurable fields for this widget.

## Configuration Options

| Field | Required | Default | Description |
| --- | --- | --- | --- |
| `accessKeyId` | Yes | — | AWS IAM access key ID |
| `secretAccessKey` | Yes | — | AWS IAM secret access key |
| `region` | No | `us-east-1` | AWS region for the SDK client. Cost Explorer is a global service but its API endpoint is always `us-east-1`. |

## Refresh Behavior

This widget **does not poll automatically**. It fetches on page load and whenever the browser tab regains focus. This is intentional — AWS Cost Explorer data updates infrequently (a few times per day) and each API call has a small cost.

## Notes

- Only **long-term IAM credentials** (access keys starting with `AKIA`) are supported. Temporary STS credentials (starting with `ASIA`) require a session token and are not currently supported.
- The displayed currency is determined by your AWS billing configuration, not a widget setting.
