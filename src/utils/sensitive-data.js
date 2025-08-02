export function maskSensitiveData(value, hideSensitive = false) {
  if (!hideSensitive || !value) {
    return value;
  }

  // Check if the value looks like an IP address
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipRegex.test(value)) {
    return "***.***.***.**";
  }

  // Check if the value looks like an IPv6 address
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  if (ipv6Regex.test(value)) {
    return "****:****:****:****:****:****:****:****";
  }

  // Check if the value contains common sensitive patterns
  const sensitivePatterns = [
    /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, // IP addresses in text
    /\b[0-9a-fA-F]{2}:[0-9a-fA-F]{2}:[0-9a-fA-F]{2}:[0-9a-fA-F]{2}:[0-9a-fA-F]{2}:[0-9a-fA-F]{2}\b/, // MAC addresses
    /\b[a-zA-Z0-9]{20,}\b/, // Long alphanumeric strings (could be keys/tokens)
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(value)) {
      return "***";
    }
  }

  // For other values that might contain sensitive data, mask partially
  if (typeof value === "string" && value.length > 8) {
    return `${value.substring(0, 3)}***${value.substring(value.length - 3)}`;
  }

  return value;
}

export function isSensitiveField(fieldName) {
  const sensitiveFields = [
    "public_ip",
    "ip",
    "address", 
    "external_ip",
    "private_ip",
    "local_ip",
    "gateway",
    "dns",
    "mac",
    "mac_address",
    "key",
    "token",
    "secret",
    "password",
    "api_key",
  ];

  return sensitiveFields.some(field => 
    fieldName.toLowerCase().includes(field)
  );
}
