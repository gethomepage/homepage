# Widget for displaying scripted information

This widget executes a script and displays the script's output. The executed script must return
the data in json format. The returned fields can be filtered, labeled and formatted.

For example to display the online status and number of players of a minecraft server the
configuration could be:

```yaml
  widget:
      type: scripted
      script: "mcstatus myserver:25565 json"
      fields: [ "online", "player_count", "ping" ]
      field_labels:
          player_count: "players"
      field_types:
          online: boolean
          ping:
              type: common.ms
              style: unit
              unit: millisecond
              unitDisplay: narrow
```

The output of the executed script of the above example is

```json
{ "online": true, "version": "1.19.2", "protocol": 760, "motd": "A Minecraft server", "player_count": 0, "player_max": 20, "players": [], "ping": 0.527 }
```

From the scripts output the three fields <code>online</code>, <code>player_count</code> and <code>ping</code>
will be displayed. The field <code>player_count</code> will be named "players". The fields <code>online</code>
and <code>ping</code> will be formatted.

## Configuration

* **script** is the script that will be executed as the user that runs the homepage server.
  It's output must be in JSON format.

* **fields** names the fields from the script's output that shall be displayed.
  It is recommended to set the fields. Otherwise the widget will be empty if no data can be displayed.

* **field_labels** defines the labels to be displayed for the fields. The field name itself is used if there
  is no label for a field, like for the fields <code>online</code> and <code>ping</code> in the example.

* **field_types** defines the types of the fields. If unset then the value is shown unformatted.
  The type's value can either be a simple string like <code>common.number</code> or a map if multiple
  configuration options shall be used like in the example above for the <code>ping</code> field.
  See the "common.XY" translation strings in the file <code>public/locales/en/common.json</code> for
  supported field types. In addition the type <code>boolean</code> is supported.
