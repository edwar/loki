export function flyToCart(from: HTMLElement, lots: number, onDone?: () => void) {
  const target = document.querySelector('[data-cart-badge]')
  if (!target) return

  const fromRect = from.getBoundingClientRect()
  const toRect = target.getBoundingClientRect()

  const el = document.createElement('div')
  el.textContent = `+${lots}`
  el.className =
    'fixed z-[99999] px-3 h-12 rounded-full bg-primary text-primary-foreground text-base font-black flex items-center justify-center shadow-xl pointer-events-none'
  el.style.willChange = 'transform, opacity'
  el.style.left = '0'
  el.style.top = '0'
  el.style.transition = 'transform 2000ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 700ms ease-out 1000ms'

  const startX = fromRect.left + fromRect.width / 2
  const startY = fromRect.top
  const endX = toRect.left + toRect.width / 2 - 15
  const endY = toRect.top

  el.style.transform = `translate(${startX}px, ${startY}px) scale(1)`
  el.style.opacity = '1'

  document.body.appendChild(el)

  requestAnimationFrame(() => {
    el.style.transform = `translate(${endX}px, ${endY}px) scale(0.5)`
    el.style.opacity = '0'
  })

  setTimeout(() => {
    el.remove()
    onDone?.()
  }, 1500)
}
