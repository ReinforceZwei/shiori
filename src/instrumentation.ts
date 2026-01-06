export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('@/features/job/worker').then(module => module.registerDefaultHandlers());
  }
}