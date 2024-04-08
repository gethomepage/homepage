---
title: Todoist
description: Todoist Widget Configuration
---

!!! warning

    The Todoist API has a rate limit of 30 requests per minute. Please be mindful of this when setting the `refreshInterval` option. This can be easily exceeded if you have multiple Todoist widgets.

Learn more about [Todoist](https://todoist.com/).

There are three types of Todoist widgets available:
- Project
- Label
- Filter

These widgets can be configured to display tasks based on the project, label, or filter. Basically a sorting mechanism to display tasks.

## Quick Configuration

```yaml
- Todoist:
    icon: todoist.png
    href: https://app.todoist.com/app/inbox
    widget:
      type: todoist
      key: <key>
      categories:
        - sort: project # required - project, label, or filter
          # project_name: project_name, label: label_name, filter: filter_name
          project_name: Example Project # required - name of the project
```
## Full Configuration

### Projects

Projects are the main way to organize tasks in Todoist.

```yaml
- Todoist:
    icon: todoist.png
    href: https://app.todoist.com/app/inbox
    widget:
      type: todoist
      # https://app.todoist.com/app/settings/integrations/developer
      # Copy API token and paste below
      key: <key>
      categories:
        - sort: project # required - type of sort
          project_name: Example Project # required - name of the project
          category_name: Todoist Project # optional - display name for the category
          maxTasks: 5 # optional - maximum number of tasks to display, default is 5
          timeZone: America/Los_Angeles # optional, specify the timezone here, default is UTC

          # Supported Colors
          # "berry_red", "red", "orange", "yellow", "olive_green",
          # "lime_green", "green", "mint_green", "teal", "sky_blue",
          # "light_blue", "blue", "grape", "violet", "lavender",
          # "magenta", "salmon", "charcoal", "grey", "taupe"
          color: blue # optional, override task color, since only projects have colors, default is blue

          # Rate limit: 30 requests per minute IN TOTAL!
          # https://developer.todoist.com/rest/v2/?shell#request-limits
          refreshInterval: 10000 # optional - refresh interval in seconds, default is 5000ms, minimum is 2000ms

        - sort: project # required - type of sort
          project_name: Groceries # required - name of the project
          category_name: Groceries # optional - display name for the category
          maxTasks: 5 # optional - maximum number of tasks to display, default is 5
          timeZone: America/Los_Angeles # optional, specify the timezone here, default is UTC

          # Supported Colors
          # "berry_red", "red", "orange", "yellow", "olive_green",
          # "lime_green", "green", "mint_green", "teal", "sky_blue",
          # "light_blue", "blue", "grape", "violet", "lavender",
          # "magenta", "salmon", "charcoal", "grey", "taupe"
          color: olive_green # optional, override task color, since only projects have colors, default is blue

          # Rate limit: 30 requests per minute IN TOTAL!
          # https://developer.todoist.com/rest/v2/?shell#request-limits
          refreshInterval: 10000 # optional - refresh interval in seconds, default is 5000ms, minimum is 2000ms
```

### Labels

Labels are used to categorize tasks. You can create a label and assign it to a task. This widget will display tasks based on the label.

```yaml
- Todoist:
    icon: todoist.png
    href: https://app.todoist.com/app/inbox
    widget:
      type: todoist
      # https://app.todoist.com/app/settings/integrations/developer
      # Copy API token and paste below
      key: <key>
      categories:
        - sort: label # required - type of sort
          label: subscriptions # required - name of the label
          category_name: Subscriptions # optional - display name for the category
          maxTasks: 5 # optional - maximum number of tasks to display, default is 5
          timeZone: America/Los_Angeles # optional, specify the timezone here, default is UTC

          # Supported Colors
          # "berry_red", "red", "orange", "yellow", "olive_green",
          # "lime_green", "green", "mint_green", "teal", "sky_blue",
          # "light_blue", "blue", "grape", "violet", "lavender",
          # "magenta", "salmon", "charcoal", "grey", "taupe"
          color: salmon # optional, override task color, since only projects have colors, default is blue

          # Rate limit: 30 requests per minute IN TOTAL!
          # https://developer.todoist.com/rest/v2/?shell#request-limits
          refreshInterval: 10000 # optional - refresh interval in seconds, default is 5000ms, minimum is 2000ms
```

### Filter

Filters are a special type of query that can be used to display tasks based on a specific query. For example, you can display tasks that are due before next week as shown below.

To find more filters, visit the Todoist's [Introduction to filters](https://todoist.com/help/articles/introduction-to-filters).

```yaml
- Todoist:
    icon: todoist.png
    href: https://app.todoist.com/app/inbox
    widget:
      type: todoist
      # https://app.todoist.com/app/settings/integrations/developer
      # Copy API token and paste below
      key: <key>
      categories:
        - sort: filter # required - type of sort
          filter: "due before: next week" # required - custom filter
          category_name: Due Before Next Week # optional - display name for the category
          maxTasks: 4 # optional - maximum number of tasks to display, default is 5
          timeZone: America/Los_Angeles # optional, specify the timezone here, default is UTC

          # Supported Colors
          # "berry_red", "red", "orange", "yellow", "olive_green",
          # "lime_green", "green", "mint_green", "teal", "sky_blue",
          # "light_blue", "blue", "grape", "violet", "lavender",
          # "magenta", "salmon", "charcoal", "grey", "taupe"
          color: orange # optional, override task color, since only projects have colors, default is blue

          # Rate limit: 30 requests per minute IN TOTAL!
          # https://developer.todoist.com/rest/v2/?shell#request-limits
          refreshInterval: 10000 # optional - refresh interval in seconds, default is 5000ms, minimum is 2000ms
```
