# Scan to PDF

PostalPoint plugin. Drives network scanners (eSCL/AirPrint), combines the output with uploaded files, saves PDFs to disk with customer and doc-type metadata, and keeps a searchable history.

## Does and doesn't

Does:
- Discovers eSCL/AirPrint scanners on the local network
- Scans from flatbed or ADF (duplex if the scanner supports it)
- Accepts uploaded images or PDFs (phone photos, SVG/WEBP/HEIC/BMP/TIFF)
- Reorders pages before saving
- Tags each save with customer, company, doc type, notes
- Writes PDFs to disk with an auto filename (Company-Customer-doctype-date.pdf)
- Keeps a searchable history in SQLite

Does not:
- Charge the customer. Use `PrintScanTool` by Skylar Ittner for billing; run them side by side.

## Install

1. Grab the latest `scan-to-pdf-v*.zip` from Releases, or build it yourself (see below).
2. PostalPoint: System Menu -> Plugins -> Install from File -> pick the zip.
3. Configure defaults in System Menu -> Plugin Settings -> Scan to PDF.
4. Open it from the Tools menu.

## Build

```bash
git clone <this-repo>
cd postalpoint-plugin-scan-to-pdf
npm install --omit=dev
./build.sh
```

The zip bundles `node_modules/` since pdf-lib is needed at runtime, so install is required before build.

GitHub Actions builds on every `v*` tag and attaches the zip to a Release. A Jenkinsfile is included for Jenkins users.

## Settings

- Default Scan DPI: 200 / 300 / 600
- Default Color Mode: RGB24 / Grayscale / Black & White
- Scan Intent: Document / TextAndGraphic / Photo / Preview
- Default Save Folder (optional): if set, skip the save dialog
- Save Mode: always ask / auto-save / auto-save with filename confirm

Settings sync across stations via PostalPoint's settings API.

## Data

First run creates `scantopdf_history`:

```sql
CREATE TABLE IF NOT EXISTS scantopdf_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    company TEXT,
    doc_type TEXT,
    page_count INTEGER,
    file_path TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
```

Every save writes a row. Query it directly or pair with a future reporting plugin.

## Roadmap

- OCR for scanned IDs and contracts
- Attach scans directly to mailbox-holder records (1583 auto-link)
- Export history as CSV

## License

MIT.
