export default function api() {
  return {
    error: (window && window.__error__) || null
  }
}
