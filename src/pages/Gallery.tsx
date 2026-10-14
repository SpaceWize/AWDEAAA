import { useCallback, useEffect, useRef, useState } from 'react';
import AmbientBackdrop from '../components/AmbientBackdrop';
import ScrollReveal from '../components/ScrollReveal';
import {
  altTextFor,
  fetchPhotos,
  isGalleryConfigured,
  photoUrl,
  samplePhotoUrl,
  samplePhotos,
  type Photo,
} from '../lib/gallery';
import { eyebrow, sectionTitle } from '../lib/styles';

type State =
  | { status: 'loading' }
  | { status: 'ready'; photos: Photo[]; sample: boolean }
  | { status: 'error' };

/** Grid thumbnails are small on purpose; the enlarged view asks for a big one. */
const THUMB_WIDTH = 600;
const FULL_WIDTH = 1600;

const Gallery = () => {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [openAt, setOpenAt] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!isGalleryConfigured) {
      setState({ status: 'ready', photos: samplePhotos(), sample: true });
      return;
    }
    const controller = new AbortController();
    fetchPhotos(controller.signal)
      .then((photos) => setState({ status: 'ready', photos, sample: false }))
      .catch((error: Error) => {
        if (error.name === 'AbortError') return;
        setState({ status: 'error' });
      });
    return () => controller.abort();
  }, []);

  const photos = state.status === 'ready' ? state.photos : [];
  const sample = state.status === 'ready' && state.sample;
  const srcFor = (photo: Photo, width: number) =>
    sample ? samplePhotoUrl(photo.id) : photoUrl(photo.id, width);

  // showModal is what makes the rest of the page inert, traps focus, and gives
  // Escape-to-close for free. Calling it imperatively keeps that behaviour
  // rather than reimplementing it badly.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openAt !== null && !dialog.open) dialog.showModal();
    if (openAt === null && dialog.open) dialog.close();
  }, [openAt]);

  const step = useCallback(
    (delta: number) =>
      setOpenAt((current) => {
        if (current === null || photos.length === 0) return current;
        // Wrap, so arrowing off either end lands somewhere sensible rather
        // than dead-ending.
        return (current + delta + photos.length) % photos.length;
      }),
    [photos.length],
  );

  const onDialogKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    }
  };

  const current = openAt === null ? null : photos[openAt];

  return (
    <>
      <section className="relative overflow-hidden bg-[var(--color-mist)] px-6 pt-32 pb-14 md:px-12 md:pt-40 md:pb-24">
        <AmbientBackdrop />
        <div className="relative mx-auto max-w-5xl">
          <ScrollReveal>
            <p className={`mb-4 ${eyebrow}`}>Gallery</p>
            <h1 className="mb-6 text-[clamp(2rem,7vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--color-body-strong)]">
              Nights out, together.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-body)]">
              Photographs from events our members have been to. Each one is
              shown in full — select any photo to see it larger.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section
        className="bg-[var(--color-paper)] px-6 py-14 md:px-12 md:py-24"
        aria-labelledby="gallery-heading"
      >
        <div className="mx-auto max-w-5xl">
          <h2 id="gallery-heading" className={`sr-only ${sectionTitle}`}>
            Photographs
          </h2>

          {/* Announced rather than only shown, so a screen reader user is told
              the photos arrived instead of meeting silence. */}
          <p aria-live="polite" className="sr-only">
            {state.status === 'loading' && 'Loading photographs.'}
            {state.status === 'ready' &&
              `${photos.length} photograph${photos.length === 1 ? '' : 's'} shown.`}
            {state.status === 'error' && 'Photographs could not be loaded.'}
          </p>

          {state.status === 'loading' && (
            <p className="text-lg text-[var(--color-body)]">Loading photographs…</p>
          )}

          {state.status === 'error' && (
            <div className="rounded-2xl border-2 border-[var(--color-brand)]/25 bg-[var(--color-mist)] p-8">
              <p className="mb-2 text-lg font-semibold text-[var(--color-body-strong)]">
                We couldn’t load the photographs just now.
              </p>
              <p className="text-[var(--color-body)]">
                Please try again shortly, or call 604-837-5616 if you need
                anything from this page.
              </p>
            </div>
          )}

          {state.status === 'ready' && photos.length === 0 && (
            <p className="text-lg text-[var(--color-body)]">
              There are no photographs here yet. Check back soon.
            </p>
          )}

          {photos.length > 0 && (
            /*
             * Columns rather than a grid, so each photo keeps its own shape.
             * A grid forces every cell to one height, which means cropping
             * portraits to squares — people's heads leave the frame, and the
             * reader has to open each one to see what it actually is.
             *
             * CSS columns fill top-to-bottom before moving across, so the tab
             * order and the visual order agree. (That is the opposite of a
             * grid set to flow by column, where they would not.)
             */
            <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4 [&>li]:break-inside-avoid">
              {photos.map((photo, index) => (
                <li key={photo.id}>
                  <button
                    type="button"
                    onClick={() => setOpenAt(index)}
                    className="group block w-full overflow-hidden rounded-2xl border border-[var(--color-brand)]/15 bg-[var(--color-mist)]"
                  >
                    <img
                      src={srcFor(photo, THUMB_WIDTH)}
                      alt={altTextFor(photo)}
                      loading="lazy"
                      decoding="async"
                      width={photo.width}
                      height={photo.height}
                      /* Holds the photo's real shape before it downloads, so a
                         long gallery doesn't shunt around as images arrive.
                         Falls back to a gentle landscape box for the rare file
                         Drive reports no dimensions for. */
                      style={{
                        aspectRatio:
                          photo.width && photo.height
                            ? `${photo.width} / ${photo.height}`
                            : '4 / 3',
                      }}
                      className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    {/* The image already carries the description; this tells a
                        screen reader what pressing the button will do, which
                        the alt text alone does not. */}
                    <span className="sr-only">
                      {`Enlarge photograph ${index + 1} of ${photos.length}`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <dialog
        ref={dialogRef}
        onClose={() => setOpenAt(null)}
        onKeyDown={onDialogKeyDown}
        aria-label="Enlarged photograph"
        className="max-h-[92vh] w-[min(92vw,70rem)] max-w-none rounded-3xl bg-[var(--color-paper)] p-0 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        {current && (
          <div className="flex max-h-[92vh] flex-col">
            <img
              src={srcFor(current, FULL_WIDTH)}
              alt={altTextFor(current)}
              className="min-h-0 w-full flex-1 bg-black object-contain"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 p-4 md:p-5">
              <p className="min-w-0 flex-1 text-base leading-relaxed text-[var(--color-body)]">
                {current.description ?? (
                  <span className="italic">No description has been added for this photograph.</span>
                )}
              </p>

              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="px-1 text-sm font-medium text-[var(--color-body)]">
                  {(openAt ?? 0) + 1} / {photos.length}
                </span>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="grid h-11 w-11 place-items-center rounded-full border-2 border-[var(--color-brand)]/30 text-[var(--color-brand-deep)] hover:bg-[var(--color-mist)]"
                >
                  <span className="sr-only">Previous photograph</span>
                  <svg aria-hidden="true" width="12" height="16" viewBox="0 0 12 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M9 1 3 8l6 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="grid h-11 w-11 place-items-center rounded-full border-2 border-[var(--color-brand)]/30 text-[var(--color-brand-deep)] hover:bg-[var(--color-mist)]"
                >
                  <span className="sr-only">Next photograph</span>
                  <svg aria-hidden="true" width="12" height="16" viewBox="0 0 12 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="m3 1 6 7-6 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setOpenAt(null)}
                  className="min-h-11 rounded-full bg-[var(--color-brand)] px-5 font-semibold text-white hover:bg-[var(--color-brand-dark)]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
};

export default Gallery;
