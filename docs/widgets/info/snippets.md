---
title: Snippets
description: Snippets Information Widget Configuration
---

The Snippets widget displays groups of commands or text snippets with a click-to-copy button. It's useful for frequently used commands, connection strings, API endpoints, or any text you regularly need to copy.

## Configuration

The widget is configured in `widgets.yaml` under the `snippets` type:

```yaml
- type: snippets
  groups:
    - name: Docker
      items:
        - command: docker ps -a
          description: List all containers
        - command: docker compose up -d
          description: Start services
    - name: SSH
      items:
        - command: ssh user@server
          description: Connect to server
```

## Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `groups` | array | Yes | List of snippet groups |
| `groups[].name` | string | No | Group heading (omit for ungrouped snippets) |
| `groups[].items` | array | Yes | List of snippet items |
| `groups[].items[].command` | string | Yes | The text to display and copy |
| `groups[].items[].description` | string | No | Short description shown next to the command |

## Behavior

- Hovering over a snippet row reveals a copy button
- Clicking the button copies the command text to the clipboard
- A checkmark icon confirms the copy for 2 seconds
- Descriptions are hidden on small screens to save space
- The clipboard API requires a secure context (HTTPS or localhost)
