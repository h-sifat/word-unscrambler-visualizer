export function toggleAttributes(arg: {
  elements: Readonly<HTMLElement[]>;
  attribute: string;
}) {
  const { elements, attribute } = arg;
  for (const element of elements) element.toggleAttribute(attribute);
}
