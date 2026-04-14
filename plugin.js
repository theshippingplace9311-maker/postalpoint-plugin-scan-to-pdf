/*
 * Scan to PDF - a PostalPoint plugin
 */
const pluginID = "app.scantopdf";
exports.id = pluginID;

exports.init = function () {
    global.apis.ui.addToolsPage(
        global.apis.getPluginFolder(pluginID) + "/page.f7",
        "Scan to PDF",
        "scantopdf",
        "Combine scanner output and phone photos into PDFs tied to customer records.",
        "Scan to PDF",
        "fa-regular fa-file-pdf"
    );

    // Ensure the scan history table exists
    (async () => {
        try {
            const db = await global.apis.database.getConnection();
            await db.query(`
                CREATE TABLE IF NOT EXISTS scantopdf_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    customer_name TEXT,
                    company TEXT,
                    doc_type TEXT,
                    page_count INTEGER,
                    file_path TEXT,
                    notes TEXT,
                    created_at TEXT DEFAULT (datetime('now'))
                )
            `);
            // If table pre-dated the company column, add it
            try { await db.query("ALTER TABLE scantopdf_history ADD COLUMN company TEXT"); } catch { /* exists */ }
        } catch (e) {
            console.error("[scantopdf] Schema init failed:", e);
        }
    })();

    // Sync settings to DB so all stations share config
    global.apis.eventbus.on("pluginSettingsSaved", async function (pluginid) {
        if (pluginid != pluginID) return;
        for (var i = 0; i < exports.config.length; i++) {
            const key = exports.config[i].key;
            const defVal = exports.config[i].defaultVal;
            await global.apis.storage.setDB(key, global.apis.settings.get(key, defVal));
        }
    });
};

exports.getSetting = async function (settingKey) {
    for (var i = 0; i < exports.config.length; i++) {
        const key = exports.config[i].key;
        const defVal = exports.config[i].defaultVal;
        if (key != settingKey) continue;
        return await global.apis.storage.getDB(key, global.apis.settings.get(key, defVal));
    }
};

exports.config = [
    {
        type: "select",
        key: pluginID + ".default_dpi",
        defaultVal: "300",
        label: "Default Scan DPI",
        text: "Higher DPI means sharper scans but larger files. 300 is good for documents, 600 for IDs.",
        options: [
            ["200", "200 DPI (fast, small)"],
            ["300", "300 DPI (recommended)"],
            ["600", "600 DPI (high quality)"]
        ]
    },
    {
        type: "select",
        key: pluginID + ".default_color",
        defaultVal: "RGB24",
        label: "Default Color Mode",
        text: "Grayscale produces smaller, cleaner files for text-only documents.",
        options: [
            ["RGB24", "Color (RGB24)"],
            ["Grayscale8", "Grayscale"],
            ["BlackAndWhite1", "Black & White"]
        ]
    },
    {
        type: "select",
        key: pluginID + ".default_intent",
        defaultVal: "Document",
        label: "Scan Intent",
        text: "How the scanner should optimize the image.",
        options: [
            ["Document", "Document (text-focused)"],
            ["TextAndGraphic", "Text and Graphics"],
            ["Photo", "Photo"],
            ["Preview", "Preview (low-res)"]
        ]
    },
    {
        type: "text",
        key: pluginID + ".default_save_folder",
        defaultVal: "",
        label: "Default Save Folder",
        placeholder: "Leave empty to pick each time (e.g. /home/user/Documents/Scans)",
        text: "If set, PDFs save here automatically with the auto-generated filename - no save dialog. Leave empty to be prompted each time."
    },
    {
        type: "select",
        key: pluginID + ".auto_save_enabled",
        defaultVal: "ask",
        label: "Save Mode",
        text: "When you click Save PDF, should it use the default folder automatically or always ask?",
        options: [
            ["ask", "Always show save dialog"],
            ["auto", "Auto-save to default folder (skip dialog)"],
            ["auto_confirm", "Auto-save to folder, but confirm filename first"]
        ]
    }
];
