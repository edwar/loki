<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Reglas

1. **No hacer commits sin permiso**: No realizar commits ni pushes hasta que el usuario lo autorice explícitamente.
2. **No ejecutar build en cada cambio**: Solo ejecutar `pnpm build` antes de hacer un push, no en cada modificación que se hace durante el desarrollo.
3. **Verificar cambios localmente**: Antes de solicitar autorización para pushear, verificar que el código funciona correctamente en local.
4. **Confirmación de Eliminación**: Todas las acciones de eliminar (delete) deben incluir obligatoriamente un modal de confirmación antes de ejecutarse para evitar pérdidas accidentales de datos.
5. **Visibilidad de Acciones**: Los botones de acciones en las tablas (editar, eliminar, ver) siempre deben estar visibles y no ocultos bajo un efecto hover (ej. evitar `opacity-0 group-hover:opacity-100`).
6. **No "Cajas dentro de Cajas"**: Evitar renderizar componentes que ya tienen bordes y fondos propios (como `Table` de shadcn) dentro de contenedores `Card` con paddings, ya que esto genera un efecto visual redundante de "caja dentro de caja". En su lugar, se debe aplicar `p-0` al `Card` contenedor y remover los bordes/sombras del componente hijo mediante selectores de Tailwind (ej. `[&>div]:border-0 [&>div]:shadow-none`).
7. **Bordes Redondeados Estándar**: Usar siempre `rounded-lg` como radio estándar en todos los contenedores, botones, inputs, modals y tarjetas. Nunca usar `rounded-xl`, `rounded-2xl`, `rounded-full` en contenedores principales ni `rounded-md` o `rounded-sm` salvo para elementos muy pequeños como badges o chips.
8. **Menos complejidad es más útil**: Preferir vistas simples y consolidadas antes que muchos puntos de navegación. Si dos módulos comparten contexto (ej. insumos y compras), unificarlos en una sola vista con secciones claras. Evitar crear nuevas rutas cuando la funcionalidad puede integrarse en una existente.
9. **Forms en Modal (CTA Pattern)**: Para registrar nuevos datos, usar un botón tipo call-to-action en la esquina superior derecha de la vista (ej. "Registrar Compra", "Agregar Producto") que abra un modal centrado. No usar acordeones colapsables ni formularios en columnas laterales. El modal debe tener header con título y botón de cerrar, cuerpo con scroll para el formulario, y footer con acciones (cancelar/guardar). Esto mantiene la vista limpia y el formulario recibe toda la atención.
