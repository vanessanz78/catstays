import { processTick } from './core.mjs';

Deno.serve(async (request: Request) => {
  const env = Deno.env.toObject();
  if(request.method !== 'POST' || !env.REVELATION_SYNC_TRIGGER_TOKEN || request.headers.get('x-sync-token') !== env.REVELATION_SYNC_TRIGGER_TOKEN) {
    return new Response('Forbidden', { status: 403 });
  }
  try {
    const result = await processTick(env);
    if (result?.phase === 'complete') {
      await fetch('https://catstays.app/api/bookings/waitlist/refresh', { method: 'POST' }).catch(() => undefined);
    }
    return Response.json(result);
  } catch(error) {
    // Never return provider URLs, secrets or customer payloads to the scheduler.
    console.error('Revelation sync batch failed; check the private job record.');
    return Response.json({ error: 'Sync batch failed; recorded for retry.' }, { status: 500 });
  }
});
