---
title: Configuration
description: Homepage Configuration
icon: material/cog
---

Homepage uses YAML for configuration, YAML stands for "YAML Ain't Markup Language.". It's a human-readable data serialization format that's a superset of JSON. Great for config files, easy to read and write. Supports complex data types like lists and objects. **Indentation matters.** If you already use Docker Compose, you already use YAML.

Here are some tips when writing YAML:

1. **Use Indentation Carefully**: YAML relies on indentation, not brackets.
2. Avoid Tabs: Stick to spaces for indentation to avoid parsing errors. 2 spaces are common.
3. Quote Strings: Use single or double quotes for strings with special characters, this is especially important for API keys.
4. Key-Value Syntax: Use key: value format. Colon must be followed by a space.
5. Validate: Always validate your YAML with a linter before deploying.

You can find tons of online YAML validators, here's one: [https://codebeautify.org/yaml-validator](https://codebeautify.org/yaml-validator), heres another: [https://jsonformatter.org/yaml-validator](https://jsonformatter.org/yaml-validator).
