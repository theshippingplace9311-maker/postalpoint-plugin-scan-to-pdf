// Scan to PDF - PostalPoint plugin
// Combines scanner output and uploaded images into PDFs tied to customer records.
// Built by admin01,  - example.com

const PLUGIN_ID = "scan-to-pdf";

async function getPage() {
    return global.apis.getPluginFolder(PLUGIN_ID) + "/scanpage.f7";
}

// Ensure the scanned_documents table exists so we can persist history
async function initSchema() {
    try {
        const db = await global.apis.database.getConnection();
        await db.query(`
            CREATE TABLE IF NOT EXISTS scan_to_pdf_documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_name TEXT,
                customer_id INTEGER,
                doc_type TEXT,
                page_count INTEGER,
                file_path TEXT,
                notes TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        `);
    } catch (e) {
        console.error("[scan-to-pdf] Could not init schema:", e);
    }
}

exports.init = function () {
    initSchema();
    global.apis.ui.addToolsPage(
        getPage,
        "Scan to PDF",
        PLUGIN_ID,
        "Combine scanner output and phone photos into PDFs tied to customer records.",
        "Scan to PDF",
        "fa-solid fa-file-pdf"
    );
    console.log("[scan-to-pdf] Loaded - by admin01 ()");
};

// Plugin settings shown in System Menu -> Plugin Settings
exports.config = [
    {
        type: "select",
        key: "app.postalpoint.scan-to-pdf_default_dpi",
        defaultVal: "300",
        label: "Default Scan DPI",
        text: "Higher DPI means larger files but sharper scans. 300 is good for documents, 600 for IDs.",
        options: [
            ["200", "200 DPI (fast, smaller files)"],
            ["300", "300 DPI (balanced - recommended)"],
            ["600", "600 DPI (high quality, slow)"]
        ]
    },
    {
        type: "select",
        key: "app.postalpoint.scan-to-pdf_default_color",
        defaultVal: "RGB24",
        label: "Default Color Mode",
        text: "Grayscale is smaller and prints cleaner for text-only docs.",
        options: [
            ["RGB24", "Color (RGB24)"],
            ["Grayscale8", "Grayscale"],
            ["BlackAndWhite1", "Black & White (smallest)"]
        ]
    },
    {
        type: "text",
        key: "app.postalpoint.scan-to-pdf_save_folder",
        defaultVal: "",
        label: "Save Folder",
        placeholder: "Leave empty for Documents/ScannedDocs",
        text: "Where PDFs are saved on disk. Leave empty to use the default Documents folder."
    }
];
