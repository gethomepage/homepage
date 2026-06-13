---
title: Model Context Protocol
---

Homepage includes an optional, lightweight [Model Context Protocol](https://modelcontextprotocol.io/) endpoint that can help AI assistants inspect, validate, and, if you explicitly allow it, update Homepage configuration files.

This endpoint is **disabled by default**. Do not expose it to an untrusted network unless you put Homepage behind authentication, TLS, and a reverse proxy that validates Host headers.

Once enabled you can use the endpoint to help an assistant understand your current Homepage configuration, add new services or widgets, and get links to relevant documentation. For example, an assistant could add a new media service to your dashboard by appending it to `services.yaml` via the MCP endpoint instead of you having to manually edit the file. For example, you can ask an assistant to add a new service entry for Paperless-ngx:

![Example of Claude Request](../../assets/claude_mcp.png)

## Enable the MCP endpoint

Set the following environment variable and restart Homepage:

```yaml
HOMEPAGE_MCP_ENABLED: "true"
```

The endpoint is available at:

```txt
http://your-homepage-instance/api/mcp
```

## Authentication

If Homepage auth is enabled with `HOMEPAGE_AUTH_ENABLED`, requests from an authenticated Homepage session are allowed.

For MCP clients that cannot use the browser session, set `HOMEPAGE_MCP_TOKEN`. Requests can then include either of the following headers:

```txt
Authorization: Bearer your-token
```

or:

```txt
X-Homepage-MCP-Token: your-token
```

Example Docker Compose environment block:

```yaml
environment:
  HOMEPAGE_MCP_ENABLED: "true"
  HOMEPAGE_AUTH_ENABLED: "true"
  HOMEPAGE_MCP_TOKEN: "change-me"
```

## Read-only by default

The MCP endpoint exposes tools for reading and validating supported Homepage config files. File writes are disabled unless you opt in with:

```yaml
HOMEPAGE_MCP_ALLOW_WRITE: "true"
```

When writes are enabled, YAML files are parsed before they are saved so a syntactically invalid YAML document is rejected instead of replacing the current file.

## Supported tools

| Tool                   | Description                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `list_config_files`    | Lists supported config files, whether they exist, and links to the related docs.                      |
| `read_config_file`     | Reads one supported config file from `HOMEPAGE_CONFIG_DIR`.                                           |
| `validate_config_file` | Validates YAML from a file or supplied content and returns line and column details for syntax errors. |
| `write_config_file`    | Replaces a supported config file when `HOMEPAGE_MCP_ALLOW_WRITE=true`.                                |
| `add_service`          | Appends a service to a group in `services.yaml` when `HOMEPAGE_MCP_ALLOW_WRITE=true`.                 |
| `add_info_widget`      | Appends an information widget to `widgets.yaml` when `HOMEPAGE_MCP_ALLOW_WRITE=true`.                 |
| `homepage_docs`        | Returns focused Homepage documentation links for common setup topics.                                 |

For example, an assistant can add a service with:

```json
{
  "group": "Media",
  "name": "Plex",
  "service": {
    "href": "https://plex.example.com",
    "icon": "plex.png",
    "description": "Movies and TV",
    "widget": {
      "type": "plex",
      "url": "https://plex.example.com",
      "key": "your-api-key"
    }
  }
}
```

Or add an info widget with:

```json
{
  "type": "openmeteo",
  "options": {
    "label": "Current",
    "latitude": 36.66,
    "longitude": -117.51,
    "cache": 5
  }
}
```

## Supported resources

The MCP server also exposes config files as MCP resources using this URI format:

```txt
homepage://config/services.yaml
```

Supported files are:

- `settings.yaml`
- `services.yaml`
- `bookmarks.yaml`
- `widgets.yaml`
- `docker.yaml`
- `kubernetes.yaml`
- `proxmox.yaml`
- `custom.css`
- `custom.js`

## Example request

```bash
curl -s http://localhost:3000/api/mcp \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your-token' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```
