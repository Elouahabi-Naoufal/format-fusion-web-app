<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<br />
<div align="center">
  <h3 align="center">FormatFusion</h3>

  <p align="center">
    A file-conversion web app: upload files, choose a target format, follow conversion progress
    and download the result — React + Flask + SQLite.
    <br />
    <a href="https://github.com/Elouahabi-Naoufal/format-fusion-web-app"><strong>Explore the source »</strong></a>
    <br />
    <br />
    <a href="https://github.com/Elouahabi-Naoufal/format-fusion-web-app/issues/new?labels=bug">Report Bug</a>
    &middot;
    <a href="https://github.com/Elouahabi-Naoufal/format-fusion-web-app/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

FormatFusion is a full-stack file converter. The front end is a React 18 + TypeScript SPA built
with Vite and shadcn/ui. The back end is a single Flask application (`backend/app.py`) that owns
the HTTP routes, SQLite access and conversion dispatch.

The format picker covers image, document, data, archive, audio, video and code formats. Actual
conversion support depends on the available Python library or external binary:

* **Images** — Pillow for raster formats, `cairosvg` for SVG, and image-to-PDF output
* **Data** — CSV to JSON and JSON to CSV using the standard library
* **Documents** — PDF and DOCX to text through PyPDF2 and python-docx; other document paths use
  `pandoc`
* **Archives** — ZIP through `zipfile`; 7Z/TAR and RAR through external tools
* **Audio and video** — FFmpeg, including audio extraction

When a required binary or library is missing, the current code falls back to copying the input
bytes to the requested output extension rather than failing. Check the output before relying on
it.

Around the converter, the app includes an admin area protected by a JWT:

* Conversion dashboard, file history and deletion
* Blog post management and content settings
* User and settings screens
* Conversion statistics and storage information

Uploaded and converted files are deleted from `uploads/` twenty seconds after a download; the
database row remains so history and counters survive.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![React][React.js]][React-url]
* [![TypeScript][TypeScript]][TypeScript-url]
* [![Vite][Vite]][Vite-url]
* [![Tailwind CSS][TailwindCSS]][TailwindCSS-url]
* [![Flask][Flask]][Flask-url]
* [![SQLite][SQLite]][SQLite-url]
* [![Pillow][Pillow]][Pillow-url]
* [![FFmpeg][FFmpeg]][FFmpeg-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

* Node.js 18+ and npm
* Python 3.8+ and pip
* Optional external tools for the corresponding formats:
  ```sh
  # Ubuntu / Debian
  sudo apt install ffmpeg pandoc p7zip-full unrar libcairo2
  ```
  Image and CSV/JSON conversion work without them.

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/Elouahabi-Naoufal/format-fusion-web-app.git
   cd format-fusion-web-app
   ```

2. Install the front end
   ```sh
   npm install
   ```

3. Install the back end
   ```sh
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cd ..
   ```

4. Start both processes
   ```sh
   npm run dev:full
   ```

   Or run them separately:
   ```sh
   # Terminal 1
   cd backend && source venv/bin/activate && python app.py

   # Terminal 2
   npm run dev
   ```

5. Open

   | URL | Service |
   | --- | --- |
   | <http://localhost:8080> | React front end |
   | <http://localhost:5000> | Flask API |
   | <http://localhost:8080/admin/login> | Admin sign-in |

   `init_db()` creates the SQLite database and its tables on first start. The seeded admin
   credentials are `admin` / `admin123`; change them before any shared deployment. Secrets and
   the database URI are currently hard-coded in `backend/app.py`, and `backend/.env` is not
   loaded by the code.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

1. Drag one or more files onto the home page and select the source and target formats.
2. Uploading calls `/api/files/upload`; `/api/convert/start` launches a worker thread per file.
3. The progress indicator polls `/api/convert/progress/<id>`.
4. Download the result from `/api/files/<id>/download`; the file is removed from disk shortly
   afterwards.
5. Administrators sign in at `/admin/login` and manage conversions, files, blog posts, content,
   users and settings from the admin area.

Key API endpoints implemented in `backend/app.py`:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness check |
| `POST` | `/api/files/upload` | Upload files and a format pair |
| `POST` | `/api/convert/start` | Start conversion workers |
| `GET` | `/api/convert/progress/<id>` | Conversion status |
| `GET` | `/api/files/<id>/download` | Download and schedule cleanup |
| `DELETE` | `/api/files/<id>` | Delete a file (JWT) |
| `POST` | `/api/admin/login` | Admin login |
| `GET` | `/api/admin/dashboard` | Admin statistics (JWT) |
| `GET` | `/api/admin/files` | Recent files (JWT) |
| `GET`/`PUT` | `/api/admin/settings` | Read/update settings (JWT) |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [x] Multi-file upload, format selection and threaded conversion
- [x] Progress polling and download with delayed cleanup
- [x] Image, CSV/JSON, archive, audio, video and document conversion paths
- [x] JWT-protected admin dashboard, files, blog and settings
- [ ] Replace the silent-copy fallback with explicit conversion errors
- [ ] Move secrets and the database URI into environment variables and load `.env`
- [ ] Implement the blog/content endpoints the admin UI calls
- [ ] Add automated tests for the conversion dispatch and admin API
- [ ] Restrict CORS and file size limits in production

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire,
and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Top contributors:

<a href="https://github.com/Elouahabi-Naoufal/format-fusion-web-app/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Elouahabi-Naoufal/format-fusion-web-app" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

This project is not licensed — all rights reserved.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Naoufal Elouahabi - [LinkedIn](https://www.linkedin.com/in/elouahabi-naoufal/) - elouahabi-naoufal1@gmail.com

Project Link: [https://github.com/Elouahabi-Naoufal/format-fusion-web-app](https://github.com/Elouahabi-Naoufal/format-fusion-web-app)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Acknowledgments

* [Flask](https://flask.palletsprojects.com/)
* [Pillow](https://python-pillow.org/)
* [FFmpeg](https://ffmpeg.org/)
* [shadcn/ui](https://ui.shadcn.com/)
* [Best-README-Template](https://github.com/othneildrew/Best-README-Template)
* [Img Shields](https://shields.io)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[contributors-shield]: https://img.shields.io/github/contributors/Elouahabi-Naoufal/format-fusion-web-app.svg?style=for-the-badge
[contributors-url]: https://github.com/Elouahabi-Naoufal/format-fusion-web-app/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Elouahabi-Naoufal/format-fusion-web-app.svg?style=for-the-badge
[forks-url]: https://github.com/Elouahabi-Naoufal/format-fusion-web-app/network/members
[stars-shield]: https://img.shields.io/github/stars/Elouahabi-Naoufal/format-fusion-web-app.svg?style=for-the-badge
[stars-url]: https://github.com/Elouahabi-Naoufal/format-fusion-web-app/stargazers
[issues-shield]: https://img.shields.io/github/issues/Elouahabi-Naoufal/format-fusion-web-app.svg?style=for-the-badge
[issues-url]: https://github.com/Elouahabi-Naoufal/format-fusion-web-app/issues
[license-shield]: https://img.shields.io/badge/license-none-lightgrey?style=for-the-badge
[license-url]: #license
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/elouahabi-naoufal/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Vite]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vite.dev/
[TailwindCSS]: https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[TailwindCSS-url]: https://tailwindcss.com/
[Flask]: https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white
[Flask-url]: https://flask.palletsprojects.com/
[SQLite]: https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white
[SQLite-url]: https://www.sqlite.org/
[Pillow]: https://img.shields.io/badge/Pillow-3776AB?style=for-the-badge&logo=python&logoColor=white
[Pillow-url]: https://python-pillow.org/
[FFmpeg]: https://img.shields.io/badge/FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white
[FFmpeg-url]: https://ffmpeg.org/
