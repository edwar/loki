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
  'bolsa',
  'cubeta',
  'par',
  'docena'
] as const

export const UNIDADES_PESO = ['gramo', 'kilogramo', 'libra', 'onza'] as const
export const UNIDADES_VOLUMEN = ['litro', 'mililitro'] as const
export const UNIDADES_SIN_CONVERSION = ['unidad', 'pack', 'caja', 'bolsa', 'cubeta', 'par', 'docena'] as const

export const UNIDADES_POR_TIPO: Record<string, string[]> = {
  peso: [...UNIDADES_PESO],
  volumen: [...UNIDADES_VOLUMEN],
  sinConversion: [...UNIDADES_SIN_CONVERSION]
}

export type Unidad = typeof UNIDADES[number]

export const UNIDADES_RECETA = [
  'kg',
  'g',
  'L',
  'mL',
  'ud',
  'pza',
  'paq'
] as const

export type UnidadReceta = typeof UNIDADES_RECETA[number]
