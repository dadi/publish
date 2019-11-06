// http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
export const isTouchDevice = window.matchMedia('(pointer: coarse)').matches

export const isMac = window.navigator.platform.startsWith('Mac')

export function openLinkPrompt(currentHref) {
  return window.prompt(
    'Enter the link URL or clear the field to remove the link',
    currentHref || ''
  )
}
