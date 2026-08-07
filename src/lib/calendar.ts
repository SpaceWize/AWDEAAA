/**
 * Reads events from a public Google Calendar.
 *
 * Why the API and not the .ics feed: Google serves the ICS export without CORS
 * headers, so a browser cannot fetch it. The Calendar API does send them, which
 * means this works from a static host with no server of our own.
 *
 * The API key sits in the built JavaScript, which is fine here and only here:
 * it is read-only, the calendar is public anyway, and the key should be
 * restricted by HTTP referrer in the Google Cloud console so it cannot be
 * reused elsewhere. Never put a key with write access in front-end code.
 */

/** Events are shown in AWDEA's own timezone, not the reader's — someone
 *  checking from another province still needs the time they'd turn up at. */
export const EVENT_TIMEZONE = 'America/Vancouver';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date | null;
  allDay: boolean;
  location?: string;
  description?: string;
  url?: string;
}

interface GoogleWhen {
  date?: string;
  dateTime?: string;
}

interface GoogleEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  start?: GoogleWhen;
  end?: GoogleWhen;
}

const CALENDAR_ID = import.meta.env.VITE_GCAL_ID as string | undefined;
const API_KEY = import.meta.env.VITE_GCAL_KEY as string | undefined;

export const isCalendarConfigured = Boolean(CALENDAR_ID && API_KEY);

/** An all-day event has `date`; a timed one has `dateTime`. */
const parseWhen = (when?: GoogleWhen): { at: Date | null; allDay: boolean } => {
  if (!when) return { at: null, allDay: false };
  if (when.dateTime) return { at: new Date(when.dateTime), allDay: false };
  if (when.date) {
    // A bare date is midnight in the event's own timezone, not UTC. Parsing it
    // as UTC would drag it back a day for anyone west of Greenwich — which is
    // everyone reading this site.
    const [y, m, d] = when.date.split('-').map(Number);
    return { at: new Date(y, m - 1, d), allDay: true };
  }
  return { at: null, allDay: false };
};

export const fetchUpcomingEvents = async (
  signal?: AbortSignal,
): Promise<CalendarEvent[]> => {
  if (!isCalendarConfigured) throw new Error('Calendar is not configured yet.');

  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      CALENDAR_ID as string,
    )}/events`,
  );
  url.searchParams.set('key', API_KEY as string);
  url.searchParams.set('timeMin', new Date().toISOString());
  // Expands a repeating event into its individual dates, so "first Tuesday of
  // the month" shows up as real entries rather than one rule nobody can read.
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('maxResults', '50');

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Calendar request failed (${response.status})`);
  }

  const data = (await response.json()) as { items?: GoogleEvent[] };
  return (data.items ?? [])
    .map((item): CalendarEvent | null => {
      const { at: start, allDay } = parseWhen(item.start);
      if (!start) return null;
      const { at: end } = parseWhen(item.end);
      return {
        id: item.id,
        title: item.summary?.trim() || 'Untitled event',
        start,
        end,
        allDay,
        location: item.location?.trim() || undefined,
        description: item.description?.trim() || undefined,
        url: item.htmlLink,
      };
    })
    .filter((event): event is CalendarEvent => event !== null);
};

/** Groups events under the month they fall in, preserving date order. */
export const groupByMonth = (events: CalendarEvent[]) => {
  const format = new Intl.DateTimeFormat('en-CA', {
    month: 'long',
    year: 'numeric',
    timeZone: EVENT_TIMEZONE,
  });
  const months = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = format.format(event.start);
    const bucket = months.get(key);
    if (bucket) bucket.push(event);
    else months.set(key, [event]);
  }
  return Array.from(months, ([month, items]) => ({ month, items }));
};

export const formatEventDate = (event: CalendarEvent) =>
  new Intl.DateTimeFormat('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: EVENT_TIMEZONE,
  }).format(event.start);

export const formatEventTime = (event: CalendarEvent) => {
  if (event.allDay) return 'All day';
  const time = new Intl.DateTimeFormat('en-CA', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: EVENT_TIMEZONE,
  });
  const start = time.format(event.start);
  return event.end ? `${start} to ${time.format(event.end)}` : start;
};

/** Machine-readable value for <time datetime="…">. */
export const isoValue = (event: CalendarEvent) =>
  event.allDay ? event.start.toISOString().slice(0, 10) : event.start.toISOString();

/**
 * Stand-in events so the section can be designed and reviewed before a real
 * calendar exists. Dates are generated relative to today so it never looks
 * stale in a demo.
 */
export const sampleEvents = (): CalendarEvent[] => {
  const day = (offset: number, hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    d.setHours(hour, 0, 0, 0);
    return d;
  };
  return [
    {
      id: 'sample-1',
      title: 'Vancouver Canucks vs. Calgary Flames',
      start: day(9, 19),
      end: day(9, 22),
      allDay: false,
      location: 'Rogers Arena, Vancouver',
      description: 'Accessible seating with companion seats. Four pairs available.',
    },
    {
      id: 'sample-2',
      title: 'Symphony at the Orpheum',
      start: day(23, 20),
      end: day(23, 22),
      allDay: false,
      location: 'Orpheum Theatre, Vancouver',
      description: 'Wheelchair spaces on the orchestra level. Two pairs available.',
    },
    {
      id: 'sample-3',
      title: 'Pacific National Exhibition — accessible day pass',
      start: day(41, 10),
      end: null,
      allDay: true,
      location: 'PNE Fairgrounds, Hastings Park',
      description: 'Quiet hours until noon. Six passes available.',
    },
  ];
};
