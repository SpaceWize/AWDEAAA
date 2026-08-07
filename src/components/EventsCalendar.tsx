import { useEffect, useState } from 'react';
import ScrollReveal from './ScrollReveal';
import {
  EVENT_TIMEZONE,
  fetchUpcomingEvents,
  formatEventDate,
  formatEventTime,
  groupByMonth,
  isCalendarConfigured,
  isoValue,
  sampleEvents,
  type CalendarEvent,
} from '../lib/calendar';
import { sectionTitle } from '../lib/styles';

type State =
  | { status: 'loading' }
  | { status: 'ready'; events: CalendarEvent[]; sample: boolean }
  | { status: 'error'; message: string };

/**
 * Upcoming events, read from AWDEA's Google Calendar.
 *
 * Deliberately a list grouped by month rather than a month grid. A grid is a
 * table of mostly-empty cells: a screen reader reads it cell by cell, and on a
 * phone it either shrinks past legibility or scrolls sideways. Grouped rows
 * carry the same "what's on this month" information, read in order, and need no
 * horizontal scrolling at any width.
 *
 * Until a calendar is connected it shows sample events so the section can be
 * reviewed, clearly labelled as examples so nobody mistakes them for real ones.
 */
const EventsCalendar = () => {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (!isCalendarConfigured) {
      setState({ status: 'ready', events: sampleEvents(), sample: true });
      return;
    }
    const controller = new AbortController();
    fetchUpcomingEvents(controller.signal)
      .then((events) => setState({ status: 'ready', events, sample: false }))
      .catch((error: Error) => {
        if (error.name === 'AbortError') return;
        setState({ status: 'error', message: error.message });
      });
    return () => controller.abort();
  }, []);

  const months = state.status === 'ready' ? groupByMonth(state.events) : [];

  return (
    <section
      id="events"
      className="bg-[var(--color-paper)] px-6 py-24 md:px-12"
      aria-labelledby="events-heading"
    >
      <div className="mx-auto max-w-4xl">
        <ScrollReveal className="mb-12">
          <h2 id="events-heading" className={`mb-4 ${sectionTitle}`}>
            Upcoming events
          </h2>
          <p className="text-lg leading-relaxed text-[var(--color-body)]">
            Draws happen two weeks before each event date. All times are Pacific.
          </p>
        </ScrollReveal>

        {/* Status is announced rather than only shown, so a screen reader user
            is told the list arrived instead of meeting silence. */}
        <p aria-live="polite" className="sr-only">
          {state.status === 'loading' && 'Loading upcoming events.'}
          {state.status === 'ready' &&
            `${state.events.length} upcoming event${state.events.length === 1 ? '' : 's'} listed.`}
          {state.status === 'error' && 'Upcoming events could not be loaded.'}
        </p>

        {state.status === 'loading' && (
          <p className="text-lg text-[var(--color-body)]">Loading upcoming events…</p>
        )}

        {state.status === 'error' && (
          <div className="rounded-2xl border-2 border-[var(--color-brand)]/25 bg-[var(--color-mist)] p-8">
            <p className="mb-2 text-lg font-semibold text-[var(--color-body-strong)]">
              We couldn’t load the events list just now.
            </p>
            <p className="text-[var(--color-body)]">
              Please try again shortly, or call 604-837-5616 and we’ll tell you
              what’s coming up.
            </p>
          </div>
        )}

        {state.status === 'ready' && state.events.length === 0 && (
          <p className="text-lg text-[var(--color-body)]">
            No events are scheduled at the moment. Check back soon.
          </p>
        )}

        {state.status === 'ready' && state.sample && (
          <p className="mb-8 rounded-xl border-2 border-dashed border-[var(--color-brand)]/40 bg-[var(--color-mist)] p-4 text-sm font-medium text-[var(--color-body)]">
            Example events — these are placeholders until AWDEA’s calendar is
            connected.
          </p>
        )}

        {months.map(({ month, items }) => (
          <ScrollReveal key={month} className="mb-12 last:mb-0">
            <h3 className="mb-5 border-b-2 border-[var(--color-brand)] pb-2 text-2xl font-bold tracking-tight text-[var(--color-body-strong)]">
              {month}
            </h3>
            <ul className="space-y-5">
              {items.map((event) => (
                <li
                  key={event.id}
                  className="rounded-2xl border border-[var(--color-brand)]/15 bg-[var(--color-mist)] p-6 transition-shadow duration-300 hover:shadow-lg"
                >
                  <h4 className="mb-2 text-xl font-bold text-[var(--color-body-strong)]">
                    {event.title}
                  </h4>
                  <p className="mb-1 font-medium text-[var(--color-body-strong)]">
                    <time dateTime={isoValue(event)}>{formatEventDate(event)}</time>
                    {' · '}
                    {formatEventTime(event)}
                  </p>
                  {event.location && (
                    <p className="mb-2 text-[var(--color-body)]">{event.location}</p>
                  )}
                  {event.description && (
                    <p className="leading-relaxed text-[var(--color-body)]">
                      {event.description}
                    </p>
                  )}
                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex min-h-11 items-center font-semibold text-[var(--color-brand-deep)] underline underline-offset-4 hover:text-[var(--color-brand)]"
                    >
                      {/* The visible text is short, but the accessible name
                          names the event — a screen reader user listing links
                          would otherwise hear "add to calendar" four times
                          with no way to tell them apart. */}
                      <span aria-hidden="true">Add to my calendar</span>
                      <span className="sr-only">
                        {`Add ${event.title} to my calendar (opens in a new tab)`}
                      </span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </ScrollReveal>
        ))}

        <p className="sr-only">All event times are in the {EVENT_TIMEZONE} timezone.</p>
      </div>
    </section>
  );
};

export default EventsCalendar;
