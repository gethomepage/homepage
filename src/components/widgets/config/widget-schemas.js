const widgetSchemas = {
  resources: {
    label: "Resources",
    fields: [
      { name: "cpu", label: "Show CPU", type: "boolean", default: true },
      { name: "memory", label: "Show Memory", type: "boolean", default: true },
      { name: "disk", label: "Disk Path", type: "text", default: "/", placeholder: "/" },
      { name: "cputemp", label: "Show CPU Temp", type: "boolean", default: false },
      { name: "uptime", label: "Show Uptime", type: "boolean", default: false },
      { name: "network", label: "Show Network", type: "boolean", default: false },
      { name: "expanded", label: "Expanded View", type: "boolean", default: false },
      { name: "refresh", label: "Refresh (ms)", type: "number", default: 1500, min: 1000 },
      { name: "label", label: "Label", type: "text", placeholder: "Optional label" },
    ],
  },
  search: {
    label: "Search",
    fields: [
      {
        name: "provider",
        label: "Provider",
        type: "select",
        default: "duckduckgo",
        options: [
          { value: "google", label: "Google" },
          { value: "duckduckgo", label: "DuckDuckGo" },
          { value: "bing", label: "Bing" },
          { value: "baidu", label: "Baidu" },
          { value: "brave", label: "Brave" },
        ],
      },
      {
        name: "target",
        label: "Open In",
        type: "select",
        default: "_blank",
        options: [
          { value: "_blank", label: "New Tab" },
          { value: "_self", label: "Same Tab" },
        ],
      },
      { name: "focus", label: "Auto Focus", type: "boolean", default: false },
      { name: "showSearchSuggestions", label: "Show Suggestions", type: "boolean", default: false },
    ],
  },
  greeting: {
    label: "Greeting",
    fields: [
      { name: "text", label: "Greeting Text", type: "text", default: "", placeholder: "Welcome!" },
      {
        name: "text_size",
        label: "Text Size",
        type: "select",
        default: "xl",
        options: [
          { value: "xs", label: "XS" },
          { value: "sm", label: "SM" },
          { value: "md", label: "MD" },
          { value: "lg", label: "LG" },
          { value: "xl", label: "XL" },
          { value: "2xl", label: "2XL" },
          { value: "3xl", label: "3XL" },
          { value: "4xl", label: "4XL" },
        ],
      },
    ],
  },
  datetime: {
    label: "Date / Time",
    fields: [
      {
        name: "text_size",
        label: "Text Size",
        type: "select",
        default: "lg",
        options: [
          { value: "xs", label: "XS" },
          { value: "sm", label: "SM" },
          { value: "md", label: "MD" },
          { value: "lg", label: "LG" },
          { value: "xl", label: "XL" },
          { value: "2xl", label: "2XL" },
          { value: "3xl", label: "3XL" },
          { value: "4xl", label: "4XL" },
        ],
      },
      { name: "locale", label: "Locale", type: "text", placeholder: "en-US" },
      {
        name: "dateStyle",
        label: "Date Style",
        type: "select",
        default: "",
        options: [
          { value: "", label: "None" },
          { value: "full", label: "Full" },
          { value: "long", label: "Long" },
          { value: "medium", label: "Medium" },
          { value: "short", label: "Short" },
        ],
      },
      {
        name: "timeStyle",
        label: "Time Style",
        type: "select",
        default: "",
        options: [
          { value: "", label: "None" },
          { value: "full", label: "Full" },
          { value: "long", label: "Long" },
          { value: "medium", label: "Medium" },
          { value: "short", label: "Short" },
        ],
      },
      { name: "hour12", label: "12-Hour Format", type: "boolean", default: false },
    ],
  },
  logo: {
    label: "Logo",
    fields: [{ name: "icon", label: "Icon URL", type: "text", placeholder: "/icons/logo.png" }],
  },
  openmeteo: {
    label: "OpenMeteo Weather",
    fields: [
      { name: "latitude", label: "Latitude", type: "text", placeholder: "51.5085" },
      { name: "longitude", label: "Longitude", type: "text", placeholder: "-0.1257" },
      { name: "timezone", label: "Timezone", type: "text", placeholder: "Europe/London" },
      {
        name: "units",
        label: "Units",
        type: "select",
        default: "metric",
        options: [
          { value: "metric", label: "Metric" },
          { value: "imperial", label: "Imperial" },
        ],
      },
      { name: "cache", label: "Cache (min)", type: "number", default: 5, min: 1 },
      { name: "label", label: "Label", type: "text", placeholder: "City name" },
    ],
  },
  weatherapi: {
    label: "WeatherAPI",
    fields: [
      { name: "latitude", label: "Latitude", type: "text", placeholder: "51.5085" },
      { name: "longitude", label: "Longitude", type: "text", placeholder: "-0.1257" },
      {
        name: "units",
        label: "Units",
        type: "select",
        default: "metric",
        options: [
          { value: "metric", label: "Metric" },
          { value: "imperial", label: "Imperial" },
        ],
      },
      { name: "cache", label: "Cache (min)", type: "number", default: 5, min: 1 },
      { name: "label", label: "Label", type: "text", placeholder: "City name" },
    ],
  },
  openweathermap: {
    label: "OpenWeatherMap",
    fields: [
      { name: "latitude", label: "Latitude", type: "text", placeholder: "51.5085" },
      { name: "longitude", label: "Longitude", type: "text", placeholder: "-0.1257" },
      {
        name: "units",
        label: "Units",
        type: "select",
        default: "metric",
        options: [
          { value: "metric", label: "Metric" },
          { value: "imperial", label: "Imperial" },
        ],
      },
      { name: "cache", label: "Cache (min)", type: "number", default: 5, min: 1 },
      { name: "label", label: "Label", type: "text", placeholder: "City name" },
    ],
  },
  glances: {
    label: "Glances",
    fields: [
      { name: "url", label: "URL", type: "text", placeholder: "http://glances-host:61208" },
      {
        name: "metric",
        label: "Metric",
        type: "select",
        default: "info",
        options: [
          { value: "info", label: "Info" },
          { value: "cpu", label: "CPU" },
          { value: "memory", label: "Memory" },
          { value: "network:eth0", label: "Network" },
          { value: "disk:sda", label: "Disk" },
          { value: "sensor:Package id 0", label: "Sensor" },
          { value: "gpu:0", label: "GPU" },
          { value: "process", label: "Process" },
        ],
      },
      { name: "version", label: "Version", type: "number", default: 3 },
      { name: "label", label: "Label", type: "text", placeholder: "Server name" },
    ],
  },
  kubernetes: {
    label: "Kubernetes",
    fields: [
      { name: "cluster", label: "Cluster", type: "text", placeholder: "default" },
      { name: "nodes", label: "Show Nodes", type: "boolean", default: true },
      { name: "cpu", label: "Show CPU", type: "boolean", default: true },
      { name: "memory", label: "Show Memory", type: "boolean", default: true },
    ],
  },
  longhorn: {
    label: "Longhorn",
    fields: [
      { name: "url", label: "URL", type: "text", placeholder: "http://longhorn-host" },
      { name: "total", label: "Show Total", type: "boolean", default: true },
      { name: "labels", label: "Show Labels", type: "boolean", default: true },
    ],
  },
  stocks: {
    label: "Stocks",
    fields: [
      { name: "watchlist", label: "Symbols (comma-separated)", type: "text", placeholder: "AAPL,MSFT,GOOG" },
      { name: "showChange", label: "Show Change", type: "boolean", default: true },
      { name: "showPercentChange", label: "Show % Change", type: "boolean", default: true },
    ],
  },
  unifi_console: {
    label: "Unifi Console",
    fields: [
      { name: "url", label: "URL", type: "text", placeholder: "https://unifi-host" },
      { name: "site", label: "Site", type: "text", default: "default" },
    ],
  },
};

export const availableWidgetTypes = Object.keys(widgetSchemas);

export default widgetSchemas;
