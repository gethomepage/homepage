---
title: Home Assistant
description: Home Assistant Widget Configuration
---

Learn more about [Home Assistant](https://www.home-assistant.io/).

You will need to generate a long-lived access token for an existing Home Assistant user in its profile.

Allowed fields: `["people_home", "lights_on", "switches_on"]`.

---

Up to a maximum of four custom states and/or templates can be queried via the `custom` property like in the example below.
The `custom` property will have no effect as long as the `fields` property is defined.

- `state` will query the state of the specified `entity_id`
  - state labels and values can be user defined and may reference entity attributes in curly brackets
  - if no state label is defined it will default to `"{attributes.friendly_name}"`
  - if no state value is defined it will default to `"{state} {attributes.unit_of_measurement}"`
- `template` will query the specified template, see [Home Assistant Templating](https://www.home-assistant.io/docs/configuration/templating)
  - if no template label is defined it will be empty

```yaml
widget:
  type: homeassistant
  url: http://homeassistant.host.or.ip:port
  key: access_token
  custom:
    - state: sensor.total_power
    - state: sensor.total_energy_today
      label: energy today
    - template: "{{ states.switch|selectattr('state','equalto','on')|list|length }}"
      label: switches on
    - state: weather.forecast_home
      label: wind speed
      value: "{attributes.wind_speed} {attributes.wind_speed_unit}"
```
