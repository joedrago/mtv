# AGENTS.md — mtv.example.com codebase guide

This file is written for AI agents starting a new session on this repo. Read it before touching anything.

---

## What this is

**mtv.example.com** — a music video jukebox. A small group of friends curated 3000+ music videos (mostly YouTube, some self-hosted) and wanted to watch them MTV-style with a chyron, shuffle, playlists, and a "mirror" feature so multiple people can watch in sync.

This is a **completed rewrite** of a much older CoffeeScript/JSON-file-based system. The REWRITE.md file documents the original design goals. The new codebase (everything in `app/`) is the live product. The `old/` directory (if present) is legacy reference — never touch it.

---

## Tech stack

| Layer | Choice |
|---|---|
| Runtime | Node.js ≥ 24, ES Modules throughout |
| Server | Express 4 + Socket.io 4 |
| Database | SQLite via `better-sqlite3` (WAL mode, foreign keys on) |
| Frontend | React 18 + Material UI v6 + Zustand v5 |
| Build | Vite 5 |
| Formatter | Prettier (130 char width, 4-space tabs, no semis, no trailing commas) |
| Linter | ESLint 9 |

---

## Directory layout

```
app/
  server/src/
    index.js        — Express + Socket.io entry point
    config.js       — loads config/config.json + config/secrets.json
    db.js           — opens better-sqlite3 DB
    auth.js         — Discord OAuth2 router (/auth/discord, /auth/discord/callback, /auth/logout)
    users.js        — user CRUD, upsertDiscordUser, isAdministrator, userPublicView
    routes.js       — all /api/* REST routes
    mirror.js       — Socket.io mirror session logic (in-memory only)
    youtube.js      — YouTube Data API v3 helpers + URL/title parsers
    hosting.js      — self-hosted video download via ffmpeg/ffprobe
  web/src/
    main.jsx        — React entry
    App.jsx         — BrowserRouter + routes + PopWatcher
    api.js          — all fetch helpers (fetchJson, createVideo, setOpinion, etc.)
    socket.js       — singleton socket.io-client
    lastWatched.js  — localStorage bucket-shuffle watch history
    limits.js       — shared field length limits (also used server-side in routes.js)
    theme.js        — MUI dark theme (bg #0f1115, primary #e84855, secondary #6a8eae)
    store/
      player.js     — Zustand: queue, index, paused, volume, showQueue, mirror mode
      mirror.js     — Zustand: hostCode, viewerCode, sessionState, djCode + socket listeners
      user.js       — Zustand: current user, load/signOut
      toast.js      — Zustand: toast queue
      destination.js — Zustand: "add to playlist" destination picker state
      settings.js   — Zustand persist: quickRating preference
    pages/
      HomePage.jsx        — action cards: shuffle all, browse, playlists, shuffle liked, shuffle unrated
      BrowsePage.jsx      — full video table with search, filter (opinion/contributor/age), play/shuffle
      PlaylistsPage.jsx   — list public + own playlists
      PlaylistPage.jsx    — view a single playlist (/p/:owner/:slug)
      MirrorPage.jsx      — viewer side of a mirror session (/m/:code)
      AccountPage.jsx     — display name, label, stats, preferences, sign out
      AdminPage.jsx       — toggle contributor flags (admin only)
      ContributePage.jsx  — add videos: YouTube tab, Playlist (bulk) tab, Self-hosted tab
    components/
      Player.jsx          — THE fullscreen player overlay (YoutubeSurface, SelfHostedSurface)
      Chyron.jsx          — MTV-style lower-left fade-in text using "Kabel Black" font
      NavBar.jsx          — logo + nav links + DJ mode chip + sign in/user display
      QueuePanel.jsx      — scrollable queue sidebar inside the player
      OpinionButtons.jsx  — love/like/meh/bleh/hate rating buttons
      SortableTable.jsx   — reusable sortable table (used in browse, playlists, admin)
      FilterButton.jsx    — opinion/contributor/age filter popover for BrowsePage
      DestinationPicker.jsx — "add visible to playlist" dropdown
      EditVideoDialog.jsx — contributor dialog to edit artist/title/trim on existing video
      CreatePlaylistDialog.jsx — create new playlist dialog
      Toaster.jsx         — MUI Snackbar toast renderer
      youtubeApi.js       — loads YT IFrame API script once, returns promise
  shared/
    chyron.js       — buildChyron(video, owner, {mode}) → string[] for Chyron component
    ids.js          — (legacy id helpers, rarely needed)
    opinions.js     — opinion value constants
config/
  config.example.json   — copy to config/config.json; fields: port, publicBaseUrl, administrators (discord_id array), database, mediaDir
  secrets.example.json  — copy to config/secrets.json; fields: sessionSecret, discord.{clientId, clientSecret, redirectUri}, youtube (API key)
  handle-remap.json     — legacy import remapping (merges, user overrides, dropOrphanMediaRefs)
scripts/
  import.js         — one-shot migration from backup/*.json → data/mtv.sqlite + data/videos/
  legacy-filters.js — old filter engine used only during import to flatten playlists
data/
  mtv.sqlite        — the live database (WAL mode)
  videos/           — self-hosted .mp4 + .jpg thumbnail files
```

---

## Database schema

```sql
users (
  id INTEGER PK,
  discord_id TEXT UNIQUE,        -- null for migrated-but-not-yet-logged-in users
  discord_handle TEXT NOT NULL,  -- their current Discord username (no discriminator)
  display_name TEXT NOT NULL UNIQUE,  -- publicly shown; 2-32 [A-Za-z0-9_]
  label TEXT,                    -- e.g. "Cool Records" — shown in chyron
  is_contributor INTEGER DEFAULT 0,
  created_at INTEGER             -- unix epoch
)

videos (
  id INTEGER PK,
  source TEXT CHECK IN ('youtube','self'),
  source_ref TEXT,               -- YouTube 11-char id OR slug for self-hosted
  title TEXT,
  artist TEXT,
  duration_s INTEGER,            -- raw full length from YouTube or ffprobe
  start_s INTEGER DEFAULT -1,    -- trim start; -1 = no trim
  end_s INTEGER DEFAULT -1,      -- trim end; -1 = no trim
  thumb TEXT,                    -- URL (ytimg CDN or /videos/<ref>.jpg)
  added_by INTEGER REFERENCES users(id),
  added_at INTEGER,
  UNIQUE (source, source_ref)
)

opinions (
  user_id INTEGER REFERENCES users(id),
  video_id INTEGER REFERENCES videos(id),
  value TEXT CHECK IN ('love','like','meh','bleh','hate'),
  updated_at INTEGER,
  PRIMARY KEY (user_id, video_id)
)

playlists (
  id INTEGER PK,
  owner_id INTEGER REFERENCES users(id),
  name TEXT,
  slug TEXT,                     -- slugified name; used in URL /p/:owner/:slug
  is_public INTEGER DEFAULT 1,
  cover_video_id INTEGER,
  created_at INTEGER,
  updated_at INTEGER,
  UNIQUE (owner_id, name)
)

playlist_items (
  playlist_id INTEGER REFERENCES playlists(id),
  position INTEGER,
  video_id INTEGER REFERENCES videos(id),
  PRIMARY KEY (playlist_id, position)
)

tags / video_tags -- present in schema; not yet exposed in UI
```

---

## User roles

| Role | How granted | What it unlocks |
|---|---|---|
| Anonymous | default | browse, view public playlists, play everything, create local queue |
| Signed-in | Discord OAuth | rate videos (opinions), create/manage playlists, account page |
| Contributor | `is_contributor = 1` toggled by admin | `/contribute` page (add YouTube / self-hosted / playlist bulk import), edit video metadata |
| Administrator | discord_id in `config.administrators[]` | admin page (toggle contributor), cannot be changed via UI |

---

## Key runtime concepts

### Player / Queue
The player (`store/player.js` + `components/Player.jsx`) is a fullscreen overlay rendered at the root. It holds a `queue` array of video objects and an `index`. It renders either a `YoutubeSurface` (YT IFrame API) or `SelfHostedSurface` (`<video>` tag). The YT player is created once and reuses `loadVideoById` between tracks to preserve iOS autoplay context.

### Mirror / DJ mode
A "host" can start a mirror session (`mirror:start` socket event), gets a 4-char code. The URL `/m/CODE` lets viewers join. The server (`mirror.js`) holds in-memory state `{ video, pos, updated, playing }` and computes an effective position at broadcast time for drift correction. Viewers get `mirror:state` events. next/prev from viewers are relayed to the host via `mirror:control`. The DJ code persists in `sessionStorage` so it survives page navigation.

### Chyron
The `Chyron` component (`app/shared/chyron.js` + `components/Chyron.jsx`) renders the MTV-style lower-left text overlay using the "Kabel Black" font (`app/web/public/fonts/Kabel-Black.otf`). It fades in 3 seconds after a track starts, fades out at 15 seconds. Lines: artist, "title", record label (or "DisplayName Records"), mode (Solo Mode / Mirror Mode).

### Bucket shuffle
`lastWatched.js` persists `{ videoId: unixTimestamp }` in localStorage. `bucketShuffle()` sorts videos into time buckets (< 20min, < 1hr, ... < 10yr, never watched), shuffles each bucket, then concatenates oldest-first so unplayed videos appear first.

### Self-hosted videos
Server downloads the MP4 to `data/videos/<ref>.mp4`, runs `ffprobe` for duration, `ffmpeg` to extract a thumbnail to `data/videos/<ref>.jpg`. Served statically at `/videos/*`. `ffmpeg` must be on PATH.

---

## API routes

All under `/api/`:

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /health | none | `{ ok: true }` |
| GET | /me | none | current user or `{ user: null }` |
| PATCH | /me | user | update display_name / label |
| GET | /me/stats | user | videos_added, opinions, playlists counts |
| GET | /users | admin | list all users |
| PATCH | /users/:id | admin | toggle is_contributor |
| GET | /videos | none | all videos (with my_opinion if signed in) |
| POST | /videos/query-youtube | contributor | fetch YouTube metadata by URL/id |
| POST | /videos/query-youtube-playlist | contributor | fetch all videos from a YT playlist |
| POST | /videos | contributor | add a video (youtube or self-hosted) |
| PATCH | /videos/:id | contributor | edit artist/title/start_s/end_s |
| GET | /playlists | none | visible playlists (public + own) |
| GET | /playlists/:owner/:slug | none | playlist + items |
| POST | /playlists | user | create playlist |
| PATCH | /playlists/:id | user (owner) | rename / toggle public |
| DELETE | /playlists/:id | user (owner) | delete playlist |
| POST | /playlists/:id/items | user (owner) | add one video |
| POST | /playlists/:id/items/bulk | user (owner) | add many videos |
| DELETE | /playlists/:id/items/:videoId | user (owner) | remove video |
| GET | /opinions/:videoId | none | get own opinion |
| POST | /opinions/:videoId | user | set opinion |
| DELETE | /opinions/:videoId | user | remove opinion |

Auth routes under `/auth/`:
- GET `/auth/discord` — redirects to Discord OAuth
- GET `/auth/discord/callback` — handles callback, sets signed cookie `mtv_sid`
- POST `/auth/logout` — clears cookie

---

## Socket.io events (mirror)

Client → Server:
- `mirror:start({ requestedCode? })` → callback `{ ok, code }` — host registers/takes over session
- `mirror:setVideo({ code, video, pos, playing })` — host updates current video
- `mirror:setPlaying({ code, playing, pos })` — anyone pauses/plays
- `mirror:next({ code })` / `mirror:prev({ code })` — viewer asks host to skip
- `mirror:stop({ code })` — host ends session
- `mirror:join({ code })` → callback `{ ok, state? }` — viewer joins
- `mirror:leave({ code })` — viewer leaves

Server → Client:
- `mirror:state({ video, pos, playing })` — broadcast on any state change
- `mirror:ended({ code })` — session was destroyed
- `mirror:control({ action: 'next'|'prev' })` — relayed to host socket only

---

## Running it

```bash
# First time setup:
cp config/config.example.json config/config.json   # fill in port, administrators discord_id
cp config/secrets.example.json config/secrets.json  # fill in sessionSecret, discord, youtube

# If you have a backup/ directory from the old system:
npm run import

# Development (server + Vite HMR concurrently):
npm run dev

# Production build + serve:
npm run build
npm run server
```

Server: `http://localhost:3000` (default port).
Vite dev server: `http://localhost:5173` (default).

---

## Formatting rules

- Prettier: 130 char print width, 4-space indent, no semicolons, no trailing commas
- Run `npm run format` to format everything
- Run `npm run lint` for ESLint
- All files use ES Module syntax (`import`/`export`), no CommonJS

---

## Things that do NOT exist (don't try to add them without asking)

- No test suite (don't add tests unless User asks)
- No TypeScript
- No "Now Playing" global broadcast / world-sync (that was the old system, intentionally removed)
- No Discord bot integration
- No "Filters" freeform playlist system (replaced by normal playlist_items table)
- No stats/leaderboard page

---

## Common gotchas

- `duration_s` on a video is the **raw full length** — never user-editable. `start_s`/`end_s` are the trim points (`-1` = no trim).
- `my_opinion` is stripped from mirror state server-side (`mirror.js:setVideo`) so viewers don't see the host's rating — viewer fetches their own opinion separately.
- The YT IFrame player is created **once** and reuses `loadVideoById`/`cueVideoById` for subsequent tracks. Do not unmount/remount it between tracks.
- `isMirror` in `playerStore` means "I am a passive viewer of someone else's session" — the host is not `isMirror`, the host has `hostCode`.
- Playlists are addressed by `display_name/slug` in URLs, not by ID. Slugs are auto-generated from the name.
- Administrator status is read from `config.administrators` (array of Discord user IDs) at runtime — not stored in the DB.
- Self-hosted thumbnails are served from `/videos/<ref>.jpg`. YouTube thumbnails use `https://i.ytimg.com/vi/<ref>/mqdefault.jpg`.
- The `label` field on a user is their "record label" — displayed in the chyron instead of "{Name} Records" if set.
