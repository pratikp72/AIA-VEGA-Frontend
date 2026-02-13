import { mockDelay, MOCK_RESOURCES } from '@/services/mockData';

// Simple mock: derive calendar events from MOCK_RESOURCES by date
export async function fetchCalendarEvents() {
  try {
    await mockDelay(400);

    const events = (MOCK_RESOURCES || [])
      .filter((r) => r.date)
      .map((r) => ({
        id: `res-${r.id}`,
        title: r.title,
        start: r.date,
        end: r.date,
        type: r.type || 'other',
        url: r.url || null,
        resourceId: r.id,
      }));

    return { events };
  } catch (err) {
    // Some environments may throw DOM Event objects; coerce to Error for clearer messages
    const e = err instanceof Error ? err : new Error(String(err));
    console.error('fetchCalendarEvents error:', e);
    return { events: [] };
  }
}
