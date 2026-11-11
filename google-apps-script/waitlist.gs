/**
 * AWDEA waitlist: receives sign-ups from the website and adds them to a Sheet.
 *
 * This file lives in the Google Sheet itself (Extensions > Apps Script), not on
 * the website. It is kept in the project so there is a copy, and so changes are
 * tracked.
 *
 * ---------------------------------------------------------------------------
 *  SET-UP (about 10 minutes, once)
 * ---------------------------------------------------------------------------
 *  1. Sign in to the Google account that should OWN the list (an AWDEA one, not
 *     a personal one). Create a new Google Sheet called "AWDEA Waitlist".
 *  2. In the Sheet: Extensions > Apps Script. Delete what is there, paste ALL of
 *     this file, and click Save (the disk icon).
 *  3. Deploy > New deployment > the gear icon > Web app.
 *       Execute as: Me
 *       Who has access: Anyone
 *     Click Deploy. Google asks you to authorise it: click "Authorize access",
 *     choose your account, then "Advanced" and "Go to ... (unsafe)". That
 *     warning is normal for a script you wrote yourself; it is your own script.
 *  4. COPY the "Web app" address it shows (it ends in /exec).
 *  5. Give the website that one address:  VITE_WAITLIST_URL = the address
 *
 *  IF YOU EDIT THIS SCRIPT LATER you must redeploy for it to take effect:
 *  Deploy > Manage deployments > pencil > Version: New version > Deploy.
 *
 *  Rows appear in a tab called "Waitlist", which the script creates itself the
 *  first time someone signs up.
 * ---------------------------------------------------------------------------
 *
 *  HOW IT TELLS PEOPLE FROM PROGRAMS
 *  1. A hidden field. The sign-up form has an extra box that no visitor can see
 *     or reach. A person never fills it in; a form-filling program usually does.
 *     When it is filled, the script answers "success" so the program believes it
 *     worked, but it saves nothing.
 *  2. A minimum time. A form submitted in under a second was not typed by a
 *     person.
 *  3. A flood limit. If a lot of new addresses arrive at once, the script stops
 *     adding rows for a few minutes, so a bot cannot fill the Sheet.
 *  4. Checks on the address itself, and one row per address.
 *
 *  Be aware of what this does NOT do: a determined person who writes a program
 *  aimed at this particular form can get past layers 1 and 2. The flood limit
 *  caps the damage to a handful of junk rows, which you can delete. For stronger
 *  protection later, Cloudflare Turnstile can be added. Make a free Turnstile
 *  widget at dash.cloudflare.com, then:
 *    - in this script: Project Settings (gear) > Script properties > add
 *        TURNSTILE_SECRET = the widget's SECRET key
 *        ALLOWED_HOSTS    = spacewize.github.io   (comma-separate to add more)
 *    - on the website: set VITE_TURNSTILE_SITEKEY to the widget's SITE key.
 *  Once both are set the check is enforced. The secret key goes ONLY in Script
 *  properties; never in the website.
 *
 *  The web address of this script can be found by anyone who reads the site, so
 *  every request is treated as untrusted and checked here.
 */

var SHEET_NAME = 'Waitlist';
var HEADERS = ['Signed up', 'Email', 'Page', 'Consent'];
var CONSENT_NOTE =
  'Agreed on the form that AWDEA may email them about this opening.';
var SOURCES = { donate: true, account: true };
// Humans take longer than this from seeing the form to pressing the button.
// Generous on purpose, so password-manager autofill is never refused.
var MIN_FILL_MS = 1000;
var MAX_BODY_CHARS = 2000;
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Flood limit: at most this many NEW addresses in any burst. The count resets
// once it has been quiet for WINDOW_SECONDS.
var MAX_NEW_PER_WINDOW = 25;
var WINDOW_SECONDS = 600;

function doPost(e) {
  var raw = e && e.postData ? e.postData.contents : '';
  return respond_(handleSubmission_(raw));
}

// Opening the address in a browser does nothing useful.
function doGet() {
  return respond_({ ok: false, error: 'method_not_allowed' });
}

function respond_(result) {
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/** Every outcome is a small object; the website turns it into a message. */
function handleSubmission_(raw) {
  try {
    if (!raw || raw.length > MAX_BODY_CHARS) return { ok: false, error: 'bad_request' };

    var p = JSON.parse(raw);

    // 1. The hidden field. No person can see it, so only a program fills it in.
    //    Pretend it worked so the program learns nothing.
    if (p.website) return { ok: true };

    // 2. Far too quick to have been typed by a person. This number comes from the
    //    visitor's browser, so a program can lie about it; it only catches lazy
    //    ones.
    if (typeof p.elapsedMs === 'number' && p.elapsedMs < MIN_FILL_MS) {
      return { ok: false, error: 'too_fast' };
    }

    // 3. The email address.
    var email = String(p.email || '').trim().toLowerCase();
    // A leading = + - or @ can make a spreadsheet run the cell as a formula.
    if (!EMAIL_PATTERN.test(email) || email.length > 254 || /^[=+\-@]/.test(email)) {
      return { ok: false, error: 'invalid_email' };
    }

    // 4. OPTIONAL: Cloudflare's "are you a person" check. Only runs if a secret
    //    key has been saved in Script properties; otherwise it is skipped.
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty('TURNSTILE_SECRET');
    if (secret) {
      var verdict = JSON.parse(
        UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'post',
          payload: { secret: secret, response: String(p.token || '') },
          muteHttpExceptions: true,
        }).getContentText()
      );
      if (!verdict.success) return { ok: false, error: 'bot_check_failed' };

      // A token earned on some other website is no use here.
      var allowed = props.getProperty('ALLOWED_HOSTS');
      if (allowed) {
        var hosts = allowed.split(',').map(function (h) {
          return h.trim().toLowerCase();
        });
        if (hosts.indexOf(String(verdict.hostname || '').toLowerCase()) === -1) {
          return { ok: false, error: 'bot_check_failed' };
        }
      }
    }

    var page = SOURCES[p.source] ? p.source : 'unknown';

    // 5. Add the row. One request at a time, so two sign-ups at once cannot both
    //    pass the duplicate check and both be added.
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) return { ok: false, error: 'server' };
    try {
      var sheet = sheet_();
      var last = sheet.getLastRow();
      var existing = last > 1 ? sheet.getRange(2, 2, last - 1, 1).getValues() : [];
      for (var i = 0; i < existing.length; i++) {
        if (String(existing[i][0]).toLowerCase() === email) return { ok: true, duplicate: true };
      }

      // Flood limit, counted only for addresses that would really be added.
      var cache = CacheService.getScriptCache();
      var recent = Number(cache.get('recentSignups') || 0);
      if (recent >= MAX_NEW_PER_WINDOW) return { ok: false, error: 'busy' };
      cache.put('recentSignups', String(recent + 1), WINDOW_SECONDS);

      sheet.appendRow([new Date(), email, page, CONSENT_NOTE]);
    } finally {
      lock.releaseLock();
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: 'server' };
  }
}

function sheet_() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}
