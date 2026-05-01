// Utility functions for parsing event metadata from descriptions

export interface EventMetadata {
  description: string;
  protocolData?: string;
  regConfig?: string;
}

/**
 * Parse event description to extract metadata tags
 * Handles [PROTOCOL_DATA:...] and [REG_CONFIG:...] tags
 */
export function parseEventDescription(description: string): EventMetadata {
  if (!description) return { description: '' };

  let cleanDescription = description;
  let protocolData: string | undefined;
  let regConfig: string | undefined;

  // Extract [PROTOCOL_DATA:...]
  const protocolMatch = description.match(/\[PROTOCOL_DATA:(.*?)\]/);
  if (protocolMatch) {
    protocolData = protocolMatch[1];
    cleanDescription = description.split('[PROTOCOL_DATA:]')[0].trim();
  }

  // Extract [REG_CONFIG:...]
  const regConfigMatch = description.match(/\[REG_CONFIG:(.*?)\]/);
  if (regConfigMatch) {
    regConfig = regConfigMatch[1];
    const parts = description.split('[REG_CONFIG:]');
    cleanDescription = parts[0].trim();
  }

  return {
    description: cleanDescription,
    protocolData,
    regConfig
  };
}

/**
 * Build event description with metadata tags
 */
export function buildEventDescription(
  description: string,
  protocolData?: string,
  regConfig?: string
): string {
  let fullDescription = description;

  if (protocolData) {
    fullDescription += ` [PROTOCOL_DATA:${protocolData}]`;
  }

  if (regConfig) {
    fullDescription += ` [REG_CONFIG:${regConfig}]`;
  }

  return fullDescription;
}
