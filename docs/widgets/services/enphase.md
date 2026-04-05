---
title: Enphase
description: Enphase Solar Widget Configuration
---

Learn more about [Enphase](https://enphase.com).

This widget reads data directly from your local Enphase IQ Gateway (Envoy) over your LAN — no cloud account or API key required.

Displayed fields: current solar production, today's total production, today's total consumption, and today's imported or exported energy. Consumption and import/export fields are only shown if your gateway has consumption CT clamps installed.

## Finding your gateway IP

Your gateway's IP address can be found in your router's DHCP client list, or by checking the Enlighten app under **Devices**.

## Token (firmware 7.x+ only)

Gateways on firmware 7.0 or later require a JWT for local API access. Older firmware requires no authentication.

Visit `https://entrez.enphaseenergy.com` (your site is typically your name, found under "Site Details" on your `https://enlighten.enphaseenergy.com` page) and log in with your Enlighten credentials. The page will display a token you can copy directly.

The token is valid for one year.

## Configuration

```yaml
widget:
  type: enphase
  url: https://192.168.1.x # gateway IP, always HTTPS
  token: <jwt> # only required for firmware 7.x+
```
