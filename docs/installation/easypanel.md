---
title: Easypanel Installation
description: Install and run homepage on Easypanel
---

[Easypanel](https://easypanel.io) is a self-hosted Docker deployment platform, and homepage has a one-click deployment template there.

[![Deploy on Easypanel](https://easypanel.io/img/deploy-on-easypanel-40.svg)](https://easypanel.io/templates/homepage)

The template sets up a persistent volume for `/app/config` and mounts the Docker socket automatically so the [Docker integration](../configs/docker.md) works out of the box.

![Homepage running in the Easypanel panel](../assets/easypanel-panel.png)
