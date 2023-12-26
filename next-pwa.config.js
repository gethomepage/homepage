const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  // TODO: add option to disable offline mode
  // disable: typeof settings.offline === "boolean" ? !settings.offline : false,
  reloadOnOnline: false,
  fallbacks: {
    document: "/_offline",
  },
  cacheStartUrl: true,
  dynamicStartUrl: false,
});

module.exports.withPWA = withPWA;
