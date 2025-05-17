---
title: Homepage Move
description: Homepage Fork
---

The original homepage project located at [stancuflorin/homepage-plus](https://github.com/stancuflorin/homepage-plus/) is intentionally read-only by design. The maintainers aim to avoid adding features that alter system state or introduce complex edge cases (like full Kubernetes support).

This fork breaks that limitation to provide more control and usability for users who want lightweight container management directly from their dashboard.

Migrating your installation should be as simple as changing `image: ghcr.io/stancuflorin/homepage-plus:latest` to `image: ghcr.io/stancuflorin/homepage-plus:latest`.
