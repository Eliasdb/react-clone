export function isTextNode(value: any): value is string | number | boolean {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

export function isValidHtmlAttribute(attr: string): boolean {
  // List of valid HTML attributes (extend as needed)
  const validAttributes = [
    'id',
    'class',
    'src',
    'href',
    'alt',
    'title',
    'style',
    'type',
    'name',
    'value',
    'placeholder',
    'disabled',
  ];
  return validAttributes.includes(attr) || attr.startsWith('data-');
}
