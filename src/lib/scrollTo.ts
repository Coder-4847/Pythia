/** Anything that can scroll to an element; Lenis when smooth scrolling is on. */
interface Scroller {
  scrollTo: (el: HTMLElement, opts: { offset: number }) => void
}

let scroller: Scroller | null = null

/** Called by the smooth-scroll module so this file stays free of heavy imports. */
export function registerScroller(s: Scroller | null) {
  scroller = s
}

/** Scroll to an element by id (HashRouter owns `#`, so plain anchors can't be used). */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (scroller) scroller.scrollTo(el, { offset: -72 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
