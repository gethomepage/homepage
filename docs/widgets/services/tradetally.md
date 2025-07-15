---
title: TradeTally
description: TradeTally Widget Configuration
---

Learn more about [TradeTally](https://tradetally.io/).

TradeTally is a comprehensive trading journal and analytics platform that helps track trades, analyze performance, and gain insights into trading patterns.

Allowed fields: `["total_pnl", "win_rate", "total_trades", "total_executions"]`.

The widget requires API key authentication with your TradeTally instance.

## API Key Authentication

To generate an API key:
1. Log in to your TradeTally instance
2. Go to Settings > API Keys
3. Create a new API key with appropriate permissions

```yaml
widget:
  type: tradetally
  url: https://your-tradetally-instance.com
  key: tt_live_your_api_key_here  # TradeTally API keys start with tt_live_
```

**Note**: TradeTally API keys start with `tt_live_` and are sent as Bearer tokens in the Authorization header.

## Custom Fields

You can customize which metrics to display:

```yaml
widget:
  type: tradetally
  url: https://your-tradetally-instance.com
  key: your-api-key
  fields: ["total_pnl", "win_rate", "total_trades", "total_executions"]
```

## Date Range

You can specify a date range for the analytics:

```yaml
widget:
  type: tradetally
  url: https://your-tradetally-instance.com
  key: your-api-key
  dateRange: "30d"  # Options: "today", "7d", "30d", "90d", "ytd", "all"
```

## Widget Metrics

The widget displays the following metrics:

- **Total P&L**: Overall profit and loss across all trades
- **Win Rate**: Percentage of profitable trades
- **Total Trades**: Total number of completed trades
- **Executions**: Total number of trade executions (buy/sell orders)

All P&L values are displayed in USD with appropriate color coding (green for profits, red for losses).

## Self-Hosted Instances

For self-hosted TradeTally instances, generate an API key from your instance:

```yaml
widget:
  type: tradetally
  url: http://localhost:3000
  key: tt_live_your_api_key_here
```

## API Requirements

The widget requires access to the following TradeTally API endpoints:

- `/api/v2/analytics/overview` - For trade statistics and P&L data
- Authentication via Bearer token (API key only)

Make sure your TradeTally instance allows API access from your Homepage instance's IP address.
