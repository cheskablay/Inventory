const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const db = require('./database'); // Connect to your existing database.js
const path = require("path");
const url = require("url");

let win;
const TEMP_EMAIL = "user@example.com"; // Temporary email
const TEMP_PASSWORD = "password123"; // Temporary password

function createWindow() {
    win = new BrowserWindow({
        width: 741,
        height: 554,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
    }));

    win.webContents.on('context-menu', (event, params) => {
        const rightClickPosition = { x: params.x, y: params.y };
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Inspect Element',
                click: () => {
                    win.webContents.inspectElement(rightClickPosition.x, rightClickPosition.y);
                }
            }
        ]);
        contextMenu.popup({ window: win });
    });
}

// Event listener for login validation
ipcMain.on("login", (event, credentials) => {
    const { email, password } = credentials;

    if (email === TEMP_EMAIL && password === TEMP_PASSWORD) {
        event.reply("login-response", { success: true });
    } else {
        event.reply("login-response", { success: false });
    }
});

// Event listener for loading the landing page
ipcMain.on("load-landing-page", () => {
    if (win) {
        win.setSize(1053, 693);
        win.setResizable(true);

        win.loadURL(url.format({
            pathname: path.join(__dirname, 'landingpage.html'),
            protocol: 'file',
            slashes: true,
        }));
    } else {
        console.error("Main window is not defined.");
    }
});

// Retrieve all data from the monitoring table
ipcMain.on('get-monitoring-data', (event) => {
    db.all('SELECT * FROM monitoring', [], (err, rows) => {
        if (err) {
            console.error('Error retrieving data from monitoring:', err.message);
            event.reply('get-monitoring-data-response', { success: false });
        } else {
            event.reply('get-monitoring-data-response', { success: true, data: rows });
        }
    });
});

// Save data to the `monitoring` table
ipcMain.on("save-data", (event, data) => {
    const { dr_no, dr_date, am_code, item, item_name, cust_name, ser_no, status, picture } = data;
    db.run(`
        INSERT INTO monitoring (dr_no, dr_date, am_code, item, item_name, cust_name, ser_no, status, picture)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dr_no, dr_date, am_code, item, item_name, cust_name, ser_no, status, picture],
        function (err) {
            if (err) {
                console.error('Error inserting into monitoring:', err.message);
                event.reply("save-data-response", { success: false });
            } else {
                event.reply("save-data-response", { success: true });
            }
        });
});

// Save data to the `reports` table
ipcMain.on("save-report", (event, data) => {
    const { dr_no, dr_date, am_code, item, item_name, cust_name, ser_no, status, picture } = data;
    db.run(`
        INSERT INTO reports (dr_no, dr_date, am_code, item, item_name, cust_name, ser_no, status, picture)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dr_no, dr_date, am_code, item, item_name, cust_name, ser_no, status, picture],
        function (err) {
            if (err) {
                console.error('Error inserting into reports:', err.message);
                event.reply("save-report-response", { success: false });
            } else {
                event.reply("save-report-response", { success: true });
            }
        });
});

// Retrieve data from the `monitoring` table
ipcMain.on("get-data", (event) => {
    db.all(`SELECT * FROM monitoring`, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving monitoring data:', err.message);
            event.reply("get-data-response", { success: false, data: [] });
        } else {
            event.reply("get-data-response", { success: true, data: rows });
        }
    });
});

// Retrieve data from the `reports` table
ipcMain.on("get-reports", (event) => {
    db.all(`SELECT * FROM reports`, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving reports:', err.message);
            event.reply("get-reports-response", { success: false, data: [] });
        } else {
            event.reply("get-reports-response", { success: true, data: rows });
        }
    });
});

// Clear all data from the `monitoring` table
ipcMain.on("clear-database", (event) => {
    db.run(`DELETE FROM monitoring`, function (err) {
        if (err) {
            console.error('Error clearing monitoring data:', err.message);
            event.reply("clear-database-response", { success: false });
        } else {
            console.log("Monitoring data cleared successfully.");
            event.reply("clear-database-response", { success: true });
        }
    });
});

// Fetch data from the monitoring table
ipcMain.on("fetch-monitoring-data", (event) => {
    db.all(`SELECT * FROM monitoring`, [], (err, rows) => {
        if (err) {
            console.error("Error fetching data from monitoring:", err.message);
            event.reply("fetch-monitoring-response", { success: false, data: [] });
        } else {
            event.reply("fetch-monitoring-response", { success: true, data: rows });
        }
    });
});

// Copy data to the reports table
ipcMain.on("copy-to-reports", (event, data) => {
    const insertQuery = `
        INSERT INTO reports (dr_no, dr_date, am_code, item, item_name, cust_name, ser_no, status, picture)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.serialize(() => {
        const stmt = db.prepare(insertQuery);
        data.forEach(row => {
            stmt.run(
                row.dr_no, 
                row.dr_date, 
                row.am_code, 
                row.item, 
                row.item_name, 
                row.cust_name, 
                row.ser_no, 
                row.status, 
                row.picture
            );
        });
        stmt.finalize((err) => {
            if (err) {
                console.error("Error copying data to reports:", err.message);
                event.reply("copy-to-reports-response", { success: false });
            } else {
                event.reply("copy-to-reports-response", { success: true });
            }
        });
    });
});

// Delete a report from the reports table
ipcMain.on('delete-report', (event, reportId) => {
    db.run(`DELETE FROM reports WHERE id = ?`, [reportId], function (err) {
        if (err) {
            console.error('Error deleting report:', err.message);
            event.reply('delete-report-response', { success: false });
        } else {
            event.reply('delete-report-response', { success: true });
        }
    });
});

ipcMain.on('get-active-reports', (event) => {
    db.all(`SELECT * FROM reports WHERE status = ?`, ['active'], (err, rows) => {
        if (err) {
            console.error('Error retrieving active reports:', err.message);
            event.reply('get-active-reports-response', { success: false, data: [] });
        } else {
            event.reply('get-active-reports-response', { success: true, data: rows });
        }
    });
});

ipcMain.on('delete-report', (event, id) => {
    // Retrieve the row to delete
    db.get(`SELECT * FROM reports WHERE id = ?`, [id], (err, row) => {
        if (err) {
            console.error('Error retrieving report for deletion:', err.message);
            event.reply('delete-report-response', { success: false });
            return;
        }

        if (row) {
            // Insert the row into the archive table
            db.run(`
                INSERT INTO archive (dr_no, dr_date, am_code, item, item_name, cust_name, ser_no, status, picture)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [row.dr_no, row.dr_date, row.am_code, row.item, row.item_name, row.cust_name, row.ser_no, row.status, row.picture],
                (err) => {
                    if (err) {
                        console.error('Error archiving report:', err.message);
                        event.reply('delete-report-response', { success: false });
                        return;
                    }

                    // Delete the row from the reports table
                    db.run(`DELETE FROM reports WHERE id = ?`, [id], (err) => {
                        if (err) {
                            console.error('Error deleting report:', err.message);
                            event.reply('delete-report-response', { success: false });
                        } else {
                            event.reply('delete-report-response', { success: true });
                        }
                    });
                }
            );
        } else {
            event.reply('delete-report-response', { success: false });
        }
    });
});

// Fetch rows from the archive table
ipcMain.on('get-archive', (event) => {
    db.all(`SELECT * FROM archive`, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving archive data:', err.message);
            event.reply('get-archive-response', { success: false, data: [] });
        } else {
            event.reply('get-archive-response', { success: true, data: rows });
        }
    });
});

app.on('ready', () => {
    createWindow();

    const template = [
        {
            label: 'Biocare',
            submenu: [
                {
                    label: 'Inspect Element',
                    click: () => {
                        if (win) {
                            win.webContents.inspectElement(0, 0);
                        }
                    }
                },
                { label: 'Quit', role: 'quit' }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
});

ipcMain.on('delete-archive-row', (event, id) => {
    db.run(`DELETE FROM archive WHERE id = ?`, [id], (err) => {
        if (err) {
            console.error('Error deleting archive row:', err.message);
            event.reply('delete-archive-row-response', { success: false });
        } else {
            event.reply('delete-archive-row-response', { success: true });
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
