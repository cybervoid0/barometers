export const SortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'cat-no', label: 'Catalogue No.' },
] as const satisfies { value: string; label: string }[]

export type SortValue = (typeof SortOptions)[number]['value']
