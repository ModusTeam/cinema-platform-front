// Separate Vite development entry; never imported by the production application.
if (import.meta.env.DEV) {
  void import('./renderLab')
}
