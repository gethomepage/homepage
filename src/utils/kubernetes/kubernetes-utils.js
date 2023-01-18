export function parseCpu(cpuStr) {
  const unitLength = 1;
  const base = Number.parseInt(cpuStr, 10);
  const units = cpuStr.substring(cpuStr.length - unitLength);
  if (Number.isNaN(Number(units))) {
    switch (units) {
      case 'n':
        return base / 1000000000;
      case 'u':
        return base / 1000000;
      case 'm':
        return base / 1000;
      default:
        return base;
    }
  } else {
    return Number.parseInt(cpuStr, 10);
  }
}

export function parseMemory(memStr) {
  const unitLength = (memStr.substring(memStr.length - 1) === 'i' ? 2 : 1);
  const base = Number.parseInt(memStr, 10);
  const units = memStr.substring(memStr.length - unitLength);
  if (Number.isNaN(Number(units))) {
    switch (units) {
      case 'Ki':
        return base * 1000;
      case 'K':
        return base * 1024;
      case 'Mi':
        return base * 1000000;
      case 'M':
        return base * 1024 * 1024;
      case 'Gi':
        return base * 1000000000;
      case 'G':
        return base * 1024 * 1024 * 1024;
      default:
        return base;
    }
  } else {
    return Number.parseInt(memStr, 10);
  }
}
