<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Elouahabi-Naoufal/format-fusion-web-app">
    <h3 align="center">FormatFusion</h3>
  </a>

  <p align="center">
    A file conversion web app: drag in a file, pick a target format, watch it convert,
    download it. React 18 + TypeScript on the front, Flask and SQLite on the back.
    <br />
    <a href="https://github.com/Elouahabi-Naoufal/format-fusion-web-app"><strong>Explore the source »</strong></a>
    <br />
    <br />
    <a href="https://github.com/Elouahabi-Naoufal/format-fusion-web-app/tree/main/backend">Backend</a>
    &middot;
    <a href="https://github.com/Elouahabi-Naoufal/format-fusion-web-app/tree/main/src">Frontend</a>
    &middot;
    <a href="https://github.com/Elouahabi-Naoufal/format-fusion-web-app/issues/new?labels=bug">Report Bug</a>
    &middot;
    <a href="https://github.com/Elouahabi-Naoufal/format-fusion-web-app/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#how-a-conversion-runs">How a Conversion Runs</a></li>
        <li><a href="#supported-formats">Supported Formats</a></li>
        <li><a href="#file-lifecycle">File Lifecycle</a></li>
        <li><a href="#repository-layout">Repository Layout</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#configuration">Configuration</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#web-interface">Web Interface</a></li>
        <li><a href="#api-reference">API Reference</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li>
      <a href="#contributing">Contributing</a>
      <ul>
        <li><a href="#top-contributors">Top contributors:</a></li>
      </ul>
    </li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

FormatFusion is a single-purpose tool: drop a file in, choose a target format, get it back. The
whole back end is one file — `backend/app.py` — that combines the HTTP layer, the SQLite data
access, and the conversion dispatch. There is no service layer and no ORM usage despite
SQLAlchemy being configured; the routes open a raw `sqlite3` connection each.

The front end is a Create-Vite + shadcn/ui React app: a home page with the upload and format
picker, a blog page, and an admin area behind a JWT-protected route with dashboard, files, blog,
content, users, and settings tabs.

Conversion is real for the formats the server has a library or binary for, and silently degrades
to a byte-for-byte copy otherwise. That fallback is the single most important thing to understand
before relying on the output — see [How a Conversion Runs](#how-a-conversion-runs).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### How a Conversion Runs

`POST /api/files/upload` stores each file as `uploads/<uuid>_<secure_filename>` and inserts a row
into `files` with `status='pending'` plus the `from_format` and `to_format` the client sent.
`POST /api/convert/start` then spawns one untracked `threading.Thread` per file id running
`convert_file()`, and returns immediately.

Inside the worker:

1. `status` is set to `processing`.
2. `convert_file()` dispatches on the `(from_format, to_format)` pair and writes
   `uploads/<uuid>_<basename>_converted.<ext>`.
3. `time.sleep(2)` — the only simulated step.
4. `status` becomes `completed` with the new filename and a `completion_date`; on exception it
   becomes `failed` with the exception text in `error_message`.

`GET /api/convert/progress/<id>` does not track anything real. It maps the status column onto a
fixed number:

```python
progress_val = {'pending': 0, 'processing': 50, 'completed': 100, 'failed': 0}.get(status, 0)
```

The front end polls this to drive `ProgressIndicator`.

**The silent-copy fallback.** Every branch that shells out to `ffmpeg`, `pandoc`, `unrar`, or
`7z` catches `FileNotFoundError` / `CalledProcessError` and calls `shutil.copy2(input, output)`.
The same is true for `cairosvg` via `ImportError`. A "conversion" can therefore complete
successfully and hand back the original bytes under a new extension — for example `notes.docx` to
`notes.pdf` when `pandoc` is not installed. Check `status` and the output size, not just the HTTP
response.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Supported Formats

The picker in `src/components/FormatSelector.tsx` offers 36 formats across six categories. What
happens server-side:

| Category | Formats offered | Real conversion path | Needs |
| --- | --- | --- | --- |
| Images | JPG, PNG, GIF, BMP, TIFF, WEBP, SVG | Pillow for raster; cairosvg for SVG in/out; image → PDF supported | Pillow; cairosvg (needs libcairo) |
| Documents | PDF, DOCX, TXT, RTF, ODT, PAGES | → TXT via PyPDF2 (PDF) and python-docx (DOCX); everything else via `pandoc` | PyPDF2, python-docx, pandoc |
| Data | CSV, JSON | CSV → JSON and JSON → CSV via the stdlib `csv`/`json` modules | — |
| Archives | ZIP, RAR, 7Z, TAR, GZ | ZIP in/out via `zipfile`; 7Z and TAR via binaries; RAR read-only via `unrar` | 7z, tar, unrar |
| Audio | MP3, WAV, FLAC, AAC, OGG, M4A | ffmpeg | ffmpeg |
| Video | MP4, AVI, MOV, WMV, FLV, MKV | ffmpeg — video → MP4/AVI/MOV (H.264) and video → audio | ffmpeg |
| Code | HTML, CSS, JS, XML | HTML/CSS/JS → TXT is handled; XML falls to the default copy | — |

Not implemented despite being listed in older docs: XLSX, and the document/audio/video "simulated"
paths described in `backend/README.md` and `SETUP.md`. The dispatch table in `app.py` is the
authoritative list.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### File Lifecycle

`GET /api/files/<id>/download` sends the converted file and, in a daemon thread, sleeps 20
seconds then removes **both** the converted file and the original upload from `uploads/`. The
`files` row is deliberately kept so the admin history and the download counter survive; only the
bytes are discarded. The `Content-Disposition` filename is always `converted.<ext>`, not the
original name.

The admin's file list and delete endpoints are the only durable view of past conversions.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Repository Layout

```
.
├── src/
│   ├── pages/           # Home, Blog, NotFound, Admin
│   │   └── admin/       # AdminLogin, AdminDashboard, AdminFiles,
│   │                    # AdminBlog, AdminContent, AdminUsers, AdminSettings
│   ├── components/      # FileUpload, FormatSelector, DownloadButton,
│   │                    # ProgressIndicator, ProtectedRoute, Layout, Header, Footer
│   │   └── ui/          # shadcn/ui primitives
│   ├── lib/api.ts       # ApiClient — every fetch call lives here
│   └── hooks/           # use-mobile, use-toast, useTheme
│
├── backend/
│   ├── app.py           # the entire API — routes, SQL, conversion dispatch
│   ├── requirements.txt # Flask 2.3.3, SQLAlchemy, JWT, Pillow, PyPDF2,
│   │                    # pydub, cairosvg, python-docx
│   ├── .env             # present but never loaded by the code
│   └── app.db           # SQLite, created on first start
│
├── SETUP.md                  # local setup notes
├── DEPLOYMENT_RAILWAY.md     # a deployment *plan* — none of it is in the repo
├── MARKETING_PLAN.md         # go-to-market notes
├── MONETIZATION_PLAN.md      # Stripe pricing notes
├── SOCIAL_MEDIA_TEMPLATES.md # content templates
└── IMPLEMENTATION_GUIDE.md
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![React][React.js]][React-url]
* [![TypeScript][TypeScript]][TypeScript-url]
* [![Vite][Vite]][Vite-url]
* [![Tailwind CSS][TailwindCSS]][TailwindCSS-url]
* [![TanStack Query][TanStack-Query]][TanStack-Query-url]
* [![React Router][React-Router]][React-Router-url]
* [![Flask][Flask]][Flask-url]
* [![SQLite][SQLite]][SQLite-url]
* [![Pillow][Pillow]][Pillow-url]
* [![FFmpeg][FFmpeg]][FFmpeg-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* Node.js 18+ and npm
* Python 3.8+ (3.13 works; `pydub` is imported out and its import is commented in `app.py`)
* External binaries, on `PATH`, for the categories you intend to use:
  ```sh
  # Ubuntu / Debian
  sudo apt install ffmpeg pandoc p7zip-full unrar libcairo2

  # macOS
  brew install ffmpeg pandoc p7zip unar cairo

  ffmpeg -version && pandoc --version && 7z | head -1
  ```
  Image and CSV/JSON conversions need none of these. Audio, video, archive, and document
  conversions do — see the silent-copy fallback above for what happens without them.
* `cairosvg` additionally needs the system Cairo library (`libcairo2` / `brew install cairo`).

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Elouahabi-Naoufal/format-fusion-web-app.git
   cd format-fusion-web-app
   ```

2. Front end
   ```sh
   npm install
   ```

3. Back end
   ```sh
   cd backend
   python3 -m venv venv
   source venv/bin/activate          # venv\Scripts\activate on Windows
   pip install -r requirements.txt
   cd ..
   ```
   Or, from the repository root: `npm run backend:install`.

4. Start both
   ```sh
   npm run dev:full
   ```
   `dev:full` uses `concurrently` to run `npm run backend:dev` and `npm run dev` together. To
   run them by hand:

   ```sh
   # Terminal 1 — backend
   cd backend && source venv/bin/activate && python app.py

   # Terminal 2 — frontend
   npm run dev
   ```

   The SQLite database, its four tables, the default admin user, the default settings, and one
   sample blog post are all created by `init_db()` when `app.py` runs. There is no separate
   migration step.

5. Open the app
   | URL | What |
   | --- | --- |
   | <http://localhost:8080> | Front end — the Vite dev server port is set in `vite.config.ts` |
   | <http://localhost:5000> | Flask API |
   | <http://localhost:8080/admin/login> | Admin sign-in |

   Default admin credentials, seeded by `init_db()` and printed nowhere: `admin` / `admin123`
   (stored with `werkzeug.security.generate_password_hash`).

### Configuration

There is no working configuration layer. `app.py` hard-codes three settings and never reads the
environment:

```python
app.config['SECRET_KEY'] = 'dev-secret-key'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
```

`backend/.env` exists and `python-dotenv` is in `requirements.txt`, but `load_dotenv()` is never
called, so every key in that file — including `SECRET_KEY`, `JWT_SECRET_KEY`, `DATABASE_URL`,
`UPLOAD_FOLDER`, `MAX_CONTENT_LENGTH`, and `CORS_ORIGINS` — is inert. Likewise
`API_BASE_URL` in `src/lib/api.ts` is the literal `'http://localhost:5000/api'` with no
environment-variable escape hatch.

The one thing that *is* configurable without a code change is `MAX_CONTENT_LENGTH`, and only
implicitly: it is not set at all, so Flask's default of unlimited applies.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

### Web Interface

1. Open <http://localhost:8080> and drag files onto the upload area.
2. Pick the source and target formats from the six-category grid. Images, documents, data,
   archives, audio, video, and code each get their own panel.
3. Upload posts the files and their format pair to `/api/files/upload`, then
   `/api/convert/start` fires the workers.
4. `ProgressIndicator` polls `/api/convert/progress/<id>` and moves 0 → 50 → 100.
5. `DownloadButton` fetches `/api/files/<id>/download` as a blob and saves it as
   `converted.<ext>`. Twenty seconds later the server deletes both the input and the output.

Admin routes, all behind `ProtectedRoute` (a JWT in `localStorage.admin_token`):

| Route | Purpose |
| --- | --- |
| `/admin` | Dashboard — totals, success rate, storage, today's and this week's conversions |
| `/admin/files` | Conversion history, filterable, with delete |
| `/admin/blog` | Blog post management |
| `/admin/content` | Static page content |
| `/admin/users` | User management |
| `/admin/settings` | Key/value settings (`max_file_size`, `allowed_file_types`, `image_quality`, `audio_bitrate`) |

`/terms`, `/privacy`, `/cookies`, and `/contact` are inline placeholder `div`s in `App.tsx`. So
is `/secret-admin-panel-x9z8y7`, which mounts the same protected admin area on a second path.

### API Reference

Implemented in `backend/app.py`:

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | — | Liveness check |
| `POST` | `/api/files/upload` | — | Multipart `files[]`, `fromFormat`, `toFormat` |
| `POST` | `/api/convert/start` | — | `{"fileIds": [...]}` — spawns worker threads |
| `GET` | `/api/convert/progress/<id>` | — | `{id, fileName, progress, status}` |
| `GET` | `/api/files/<id>/download` | — | Sends the file, schedules deletion at +20s |
| `GET` | `/api/files/stats` | — | Counts, success rate, DB and upload storage in MB |
| `DELETE` | `/api/files/<id>` | JWT | Removes both files and the row |
| `POST` | `/api/admin/login` | — | `{"username", "password"}` → `{access_token, admin}` |
| `GET` | `/api/admin/dashboard` | JWT | Stats plus today/week counts |
| `GET` | `/api/admin/files` | JWT | Last 50 files, newest first |
| `GET` | `/api/admin/blog` | JWT | All blog posts, newest first |
| `GET` | `/api/admin/settings` | JWT | Key/value settings |
| `PUT` | `/api/admin/settings` | JWT | Upsert settings |
| `GET` | `/api/blog` | — | Returns `{"posts": []}` — a stub |

```sh
# Health
curl http://localhost:5000/api/health

# Upload and convert
curl -X POST http://localhost:5000/api/files/upload \
  -F "files=@logo.png" -F "fromFormat=PNG" -F "toFormat=JPG"
# {"files": [{"id": "<uuid>", "filename": "logo.png", "originalFormat": "PNG",
#             "convertedFormat": "JPG", "status": "pending"}]}

curl -X POST http://localhost:5000/api/convert/start \
  -H 'Content-Type: application/json' -d '{"fileIds": ["<uuid>"]}'

curl http://localhost:5000/api/convert/progress/<uuid>

# Admin
TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' | python3 -c 'import json,sys;print(json.load(sys.stdin)["access_token"])')

curl http://localhost:5000/api/admin/dashboard -H "Authorization: Bearer $TOKEN"
curl http://localhost:5000/api/admin/settings  -H "Authorization: Bearer $TOKEN"
```

Called by `src/lib/api.ts` but **not implemented** on the server — these return 404 today:
`GET /api/files` (paginated list), `GET /api/files/{id}`, `POST`/`PUT`/`DELETE /api/blog`,
`/api/blog/{id}`, `/api/blog/featured`, `/api/blog/categories`, and
`GET`/`PUT /api/admin/content/{page}`. The `/admin/users` page has no endpoint behind it at all.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [x] Upload, format selection, threaded conversion, progress polling, download
- [x] Real image conversion through Pillow, including SVG in/out via cairosvg and image → PDF
- [x] Real CSV ↔ JSON conversion
- [x] ZIP handling with `zipfile`; RAR, 7Z, and TAR through external binaries
- [x] ffmpeg-backed audio, video, and video → audio conversions
- [x] PDF → TXT via PyPDF2 and DOCX → TXT via python-docx
- [x] JWT admin login, dashboard statistics, file history, and key/value settings
- [ ] Read configuration from the environment. `SECRET_KEY` and `JWT_SECRET_KEY` are literals in
      `app.py`, `load_dotenv()` is never called despite `python-dotenv` being installed, and
      `API_BASE_URL` in `src/lib/api.ts` has no `import.meta.env` fallback.
- [ ] Implement the endpoints the front end already calls: `GET /api/files` with real
      pagination, `GET /api/files/{id}`, the blog CRUD surface, and
      `/api/admin/content/{page}`. `GET /api/blog` currently returns a hardcoded empty list.
- [ ] Honour `page`, `per_page`, `status`, and `search` on `/api/admin/files` and
      `/api/admin/blog`. The parameters are sent by `ApiClient` and silently discarded; the
      endpoints return `LIMIT 50` or the whole table.
- [ ] Fail loudly when `ffmpeg`, `pandoc`, `unrar`, or `7z` is missing, instead of returning a
      copy of the input under a new extension.
- [ ] Replace the per-request `sqlite3.connect` calls with the SQLAlchemy `db` object that is
      already configured but never used.
- [ ] Close the open admin route. `/secret-admin-panel-x9z8y7` mounts the same protected
      `Admin` layout as `/admin`.
- [ ] Replace the inline placeholder routes (`/terms`, `/privacy`, `/cookies`, `/contact`) with
      real pages driven by the settings table.
- [ ] Add tests. There is no test runner or test file in the repository.
- [ ] Fix the two broken npm scripts. `backend:init` runs `python init_db.py` and `backend:prod`
      runs `python run.py`; neither file exists — `backend/` contains only `app.py`,
      `requirements.txt`, `.env`, and `app.db`. Either add the files or repoint the scripts at
      `app.py`.
- [ ] Production hardening, in the order `DEPLOYMENT_RAILWAY.md` lays it out: a WSGI entrypoint
      instead of `app.run(debug=True, ...)`, a non-wildcard `CORS_ORIGINS`, a file-size limit,
      and PostgreSQL via `DATABASE_URL`. Note that `DEPLOYMENT_RAILWAY.md` is a plan — there is no
      `railway.toml`, no Dockerfile, no Stripe integration, and no PostgreSQL migration code in
      this repository.

See the [open issues](https://github.com/Elouahabi-Naoufal/format-fusion-web-app/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

If you add a conversion, wire it into the dispatch chain in `backend/app.py` **and** add it to
`formatCategories` in `src/components/FormatSelector.tsx` — the two lists are maintained
separately and already disagree. If your path depends on an external binary, say so in a comment
and decide what happens when it is absent.

Before opening a pull request: `npm run lint` and `npm run build` on the front end, and a manual
round-trip on the back end (upload → convert → download) with the relevant binary on `PATH`.

### Top contributors:

<a href="https://github.com/Elouahabi-Naoufal/format-fusion-web-app/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Elouahabi-Naoufal/format-fusion-web-app" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

No license file is currently bundled with this repository. Until one is added, the default GitHub
terms apply and the repository should be treated as unlicensed — do not redistribute it without
asking.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Naoufal Elouahabi - [LinkedIn](https://www.linkedin.com/in/elouahabi-naoufal/) - elouahabi-naoufal1@gmail.com

Project Link: [https://github.com/Elouahabi-Naoufal/format-fusion-web-app](https://github.com/Elouahabi-Naoufal/format-fusion-web-app)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Vite](https://vite.dev/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/),
  and [shadcn/ui](https://ui.shadcn.com/) — `components.json` carries the shadcn config
* [TanStack Query](https://tanstack.com/query) for data fetching and
  [Recharts](https://recharts.org/) for the admin charts
* [Flask](https://flask.palletsprojects.com/) and [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/)
* [Pillow](https://python-pillow.org/), [PyPDF2](https://pypi.org/project/PyPDF2/),
  [python-docx](https://python-docx.readthedocs.io/), and
  [CairoSVG](https://cairosvg.org/) for in-process conversion
* [FFmpeg](https://ffmpeg.org/), [Pandoc](https://pandoc.org/), [7-Zip](https://www.7-zip.org/),
  and [unrar](https://www.rarlab.com/) for out-of-process conversion
* [Img Shields](https://shields.io)
* [Choose an Open Source License](https://choosealicense.com)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/Elouahabi-Naoufal/format-fusion-web-app.svg?style=for-the-badge
[contributors-url]: https://github.com/Elouahabi-Naoufal/format-fusion-web-app/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Elouahabi-Naoufal/format-fusion-web-app.svg?style=for-the-badge
[forks-url]: https://github.com/Elouahabi-Naoufal/format-fusion-web-app/network/members
[stars-shield]: https://img.shields.io/github/stars/Elouahabi-Naoufal/format-fusion-web-app.svg?style=for-the-badge
[stars-url]: https://github.com/Elouahabi-Naoufal/format-fusion-web-app/stargazers
[issues-shield]: https://img.shields.io/github/issues/Elouahabi-Naoufal/format-fusion-web-app.svg?style=for-the-badge
[issues-url]: https://github.com/Elouahabi-Naoufal/format-fusion-web-app/issues
[license-shield]: https://img.shields.io/github/license/Elouahabi-Naoufal/format-fusion-web-app.svg?style=for-the-badge
[license-url]: https://github.com/Elouahabi-Naoufal/format-fusion-web-app
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/elouahabi-naoufal/
[React.js]: https://img.shields.io/badge/React-18.3-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
[TypeScript]: https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Vite]: https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vite.dev/
[TailwindCSS]: https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[TailwindCSS-url]: https://tailwindcss.com/
[TanStack-Query]: https://img.shields.io/badge/TanStack%20Query-5.56-FF4155?style=for-the-badge&logo=tanstack&logoColor=white
[TanStack-Query-url]: https://tanstack.com/query
[React-Router]: https://img.shields.io/badge/React%20Router-6.26-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white
[React-Router-url]: https://reactrouter.com/
[Flask]: https://img.shields.io/badge/Flask-2.3-000000?style=for-the-badge&logo=flask&logoColor=white
[Flask-url]: https://flask.palletsprojects.com/
[SQLite]: https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white
[SQLite-url]: https://www.sqlite.org/
[Pillow]: https://img.shields.io/badge/Pillow-10.4-FFD43B?style=for-the-badge&logo=python&logoColor=black
[Pillow-url]: https://python-pillow.org/
[FFmpeg]: https://img.shields.io/badge/FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white
[FFmpeg-url]: https://ffmpeg.org/