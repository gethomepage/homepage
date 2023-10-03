---
title: Homepage Move
description: Homepage Container Deprecation
---

As of v0.7.1 homepage migrated from benphelps/homepage to an "orgnization" located at gethomepage/homepage. The reason for this is to setup the project for longevity and allow for community maintenance.

Migrating your installation should be as simple as changing `image: ghcr.io/benphelps/homepage:latest` to `image: ghcr.io/gethomepage/homepage:latest`.