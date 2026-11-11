/**
 * AWDEA waitlist: receives sign-ups from the website and adds them to a Sheet.
 *
 * This file lives in the Google Sheet itself (Extensions > Apps Script), not on
 * the website. It is kept here so there is a copy, and so changes are tracked.
 *
 * ---------------------------------------------------------------------------
 *  SET-UP (about 15 minutes, once)
 * ---------------------------------------------------------------------------
 *  1. Sign in to the Google account that should OWN the list (an AWDEA one, not
 *     a personal one). Create a new Google Sheet called "AWDEA Waitlist".
 *  2. In the Sheet: Extensions > Apps Script. Delete what is there, paste ALL of
 *     this file, and click Save.
 *  3. Cloudflare Turnstile (the bot check). Go to dash.cloudflare.com, create a
 *     free account, open Turnstile, and add a widget:
 *       - Hostnames: spacewize.github.io  (add awdea.org later)
 *       - Widget mode: Managed
 *     You get two keys. The SITE key is public. The SECRET key is private.
 *  4. In Apps Script: Project Settings (gear icon) > Script properties > Add:
 *       TURNSTILE_SECRET = the SECRET key from Cloudflare
 *       ALLOWED_HOSTS    = spacewize.github.io   (comma-separate to add more)
 *  5. Deploy > New deployment > the gear icon > Web app.
 *       Execute as: Me
 *       Who has access: Anyone
 *     Click Deploy and approve the permissions. COPY the Web app URL it shows.
 *  6. Give the website two values (public, safe to share):
 *       VITE_WAITLIST_URL        = the Web app URL from step 5
 *       VITE_TURNSTILE_SITEKEY   = the SITE key from step 3
 *
 *  IF YOU EDIT THIS SCRIPT LATER you must redeploy for it to take effect:
 *  Deploy > Manage deployments > pencil > Version: New version > Deploy.
 * ---------------------------------------------------------------------------
 *
 *  Never put the Turnstile SECRET key in the website or in this file. It belongs
 *  only in Script properties, where the website cannot see it.
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

    // 1. The hidden field. No person can see it, so only a bot fills it in.
    //    Pretend it worked so the bot learns nothing.
    if (p.website) return { ok: true };

    // 2. Far too quick to have been typed by a person. This number comes from the
    //    visitor's browser, so a bot can lie about it. It only catches lazy ones;
    //    the Cloudflare check below is the real defence.
    if (typeof p.elapsedMs === 'number' && p.elapsedMs < MIN_FILL_MS) {
      return { ok: false, error: 'too_fast' };
    }

    // 3. The email address.
    var email = String(p.email || '').trim().toLowerCase();
    // A leading = + - or @ can make a spreadsheet run the cell as a formula.
    if (!EMAIL_PATTERN.test(email) || email.length > 254 || /^[=+\-@]/.test(email)) {
      return { ok: false, error: 'invalid_email' };
    }

    // 4. Ask Cloudflare whether the visitor passed the bot check.
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty('TURNSTILE_SECRET');
    if (!secret) return { ok: false, error: 'server' };

    var verdict = JSON.parse(
      UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'post',
        payload: { secret: secret, response: String(p.token || '') },
        muteHttpExceptions: true,
      }).getContentText()
    );
    if (!verdict.success) return { ok: false, error: 'bot_check_failed' };

    // 5. A token earned on some other website is no use here.
    var allowed = props.getProperty('ALLOWED_HOSTS');
    if (allowed) {
      var hosts = allowed.split(',').map(function (h) {
        return h.trim().toLowerCase();
      });
      if (hosts.indexOf(String(verdict.hostname || '').toLowerCase()) === -1) {
        return { ok: false, error: 'bot_check_failed' };
      }
    }

    var page = SOURCES[p.source] ? p.source : 'unknown';

    // 6. Add the row. One person at a time, so two sign-ups at once cannot
    //    both pass the duplicate check and both be added.
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) return { ok: false, error: 'server' };
    try {
      var sheet = sheet_();
      var last = sheet.getLastRow();
      var existing = last > 1 ? sheet.getRange(2, 2, last - 1, 1).getValues() : [];
      for (var i = 0; i < existing.length; i++) {
        if (String(existing[i][0]).toLowerCase() === email) return { ok: true, duplicate: true };
      }
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
