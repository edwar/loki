export const UNIDADES = [
  'unidad', 
  'gramo', 
  'kilogramo', 
  'litro', 
  'mililitro', 
  'libra', 
  'onza', 
  'pack', 
  'caja', 
  'bolsa'
] as const

export type Unidad = typeof UNIDADES[number]
