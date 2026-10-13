/**
 * Reads photos from a public Google Drive folder.
 *
 * Same shape as the calendar: AWDEA edits in a tool they already know, and the
 * site follows. Drop a photo in the folder and it appears here; remove it and
 * it goes. Nobody touches code.
 *
 * Why Drive and not Google Photos: the Photos API only works through OAuth —
 * a real sign-in with tokens to refresh — so it cannot be read with a plain
 * key from a static site. Drive's API can, and it sends CORS headers, so the
 * browser is allowed to call it directly.
 *
 * The API key ships in the built JavaScript. That is acceptable here for the
 * same reasons as the calendar: it is read-only, the folder is public anyway,
 * and the key is restricted by HTTP referrer so it cannot be used elsewhere.
 */

export interface Photo {
  id: string;
  /** The file name, used only as a last-resort label. */
  name: string;
  /**
   * The Drive file's Description field, which AWDEA can edit in the Drive UI.
   * This is the alt text, so an empty one is a real cost to a blind visitor,
   * not a cosmetic gap.
   */
  description?: string;
  /** Taken-on date when the camera recorded one, for ordering and grouping. */
  takenAt?: Date;
  /**
   * Pixel dimensions as Drive reports them. Used to reserve each photo's exact
   * shape before it downloads, so a long gallery does not shunt itself around
   * as images arrive. Absent for the odd file Drive has no metadata for, which
   * the layout has to tolerate.
   */
  width?: number;
  height?: number;
}

interface DriveFile {
  id: string;
  name: string;
  description?: string;
  mimeType: string;
  imageMediaMetadata?: { time?: string; width?: number; height?: number };
}

const FOLDER_ID = import.meta.env.VITE_GDRIVE_FOLDER as string | undefined;
// Its own key, because a Google API key can be restricted to particular APIs
// and the calendar's is scoped to Calendar only. Falls back to the calendar
// key so a single key cleared for both APIs also works.
const API_KEY = (import.meta.env.VITE_GDRIVE_KEY ||
  import.meta.env.VITE_GCAL_KEY) as string | undefined;

export const isGalleryConfigured = Boolean(FOLDER_ID && API_KEY);

/**
 * Drive serves images from a separate host that takes a width, so the grid can
 * ask for small files and the enlarged view for big ones. Requesting the
 * original every time would push several megabytes down a phone connection to
 * render thumbnails.
 */
export const photoUrl = (id: string, width: number) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`;

/** `2024:08:13 19:41:02` — EXIF's format, which Date cannot parse as-is. */
const parseExifTime = (raw?: string): Date | undefined => {
  if (!raw) return undefined;
  const m = raw.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!m) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  const [, y, mo, d, h, mi, s] = m;
  return new Date(+y, +mo - 1, +d, +h, +mi, +s);
};

export const fetchPhotos = async (signal?: AbortSignal): Promise<Photo[]> => {
  if (!isGalleryConfigured) throw new Error('Gallery is not configured yet.');

  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('key', API_KEY as string);
  url.searchParams.set('q', `'${FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`);
  // Ask for the description explicitly: Drive's default field set omits it,
  // and it is the whole reason this works as accessible alt text.
  url.searchParams.set('fields', 'files(id,name,description,mimeType,imageMediaMetadata(time,width,height))');
  // Numeric-aware, so "10-raffle.jpg" sorts after "9-raffle.jpg" rather than
  // before it — numbering filenames is the no-code way to control order.
  url.searchParams.set('orderBy', 'name_natural');
  url.searchParams.set('pageSize', '100');

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Photo request failed (${response.status})`);
  }

  const data = (await response.json()) as { files?: DriveFile[] };
  return (data.files ?? []).map((file) => ({
    id: file.id,
    name: file.name,
    description: file.description?.trim() || undefined,
    takenAt: parseExifTime(file.imageMediaMetadata?.time),
    width: file.imageMediaMetadata?.width,
    height: file.imageMediaMetadata?.height,
  }));
};

/**
 * What a screen reader announces for a photo.
 *
 * A file name is not a description — "IMG_4471.jpg" read aloud is noise. When
 * the Description field is empty, say plainly that there is no description
 * rather than dressing the file name up as one.
 */
export const altTextFor = (photo: Photo) =>
  photo.description ?? 'Photo from an AWDEA event. No description has been added for this one yet.';

/**
 * Stand-in photos so the page can be designed and demonstrated before a real
 * folder is connected. Deliberately uses the clips' poster frames, which are
 * already in the build, rather than pulling placeholder images off the web.
 */
export const samplePhotos = (): Photo[] => [
  {
    id: 'sample-1',
    name: 'sample-1',
    description:
      'Four people seated together in an accessible seating area at a concert, laughing between songs.',
    width: 854,
    height: 480,
  },
  {
    id: 'sample-2',
    name: 'sample-2',
    description:
      'A wheelchair user on a boardwalk ramp at an outdoor festival, gloved hand on the wheel rim.',
    width: 740,
    height: 740,
  },
  {
    id: 'sample-3',
    name: 'sample-3',
    description:
      'A volunteer handing over an envelope of tickets outside an arena on a wet evening.',
    width: 854,
    height: 480,
  },
];

/** Local stand-ins for the sample set; real photos come from Drive. */
export const samplePhotoUrl = (id: string) => {
  const base = import.meta.env.BASE_URL;
  if (id === 'sample-2') return `${base}media/ramp-wheelchair-poster.jpg`;
  return `${base}media/about-conversation-poster.jpg`;
};
