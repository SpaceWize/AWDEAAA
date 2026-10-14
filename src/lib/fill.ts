/** Swaps {name} markers in a sentence from content.ts for real values. */
export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (marker, key: string) =>
    key in values ? String(values[key]) : marker,
  );
