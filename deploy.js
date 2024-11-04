// deploy.js

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const http = require('http');
const url = require('url');
const mime = require('mime-types');
const { exec } = require('child_process');
const cheerio = require('cheerio'); // Import Cheerio

// Paths
const bookmarkletPath = path.join(__dirname, 'assets', 'js', 'bookmarklet.js');
const minifiedPath = path.join(__dirname, 'assets', 'js', 'bookmarklet.min.js');
const indexPath = path.join(__dirname, 'index.html');
const packageJsonPath = path.join(__dirname, 'package.json');

// Function to perform deployment
async function deploy() {
    try {
        // Read version from package.json
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        let version = packageJson.version || '1.0.0';

        // Increment the patch version automatically
        let [major, minor, patch] = version.split('.').map(Number);
        patch += 1;
        version = `${major}.${minor}.${patch}`;

        // Update the version in package.json
        packageJson.version = version;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
        console.log(`✔ Version number updated to ${version} in package.json.`);

        // Get current date and time
        const lastUpdated = new Date().toLocaleString();

        // Read the original bookmarklet.js (unminified)
        const bookmarkletCodeOriginal = fs.readFileSync(bookmarkletPath, 'utf8');

        // Minify the bookmarklet.js
        const minifiedResult = await minify(bookmarkletCodeOriginal);
        const minifiedCode = minifiedResult.code;

        // Save the minified code
        fs.writeFileSync(minifiedPath, minifiedCode, 'utf8');
        console.log('✔ bookmarklet.min.js has been created.');

        // Generate the bookmarklet code
        const bookmarkletCode = `javascript:(function(){${minifiedCode}})();`;

        // Escape characters for inclusion in HTML attribute
        const bookmarkletCodeEscaped = bookmarkletCode
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Debugging: Log the bookmarklet code
        console.log('✔ Generated bookmarklet code:');
        console.log(bookmarkletCode);

        // Read index.html
        let indexHtml = fs.readFileSync(indexPath, 'utf8');

        // Load the HTML into Cheerio
        const $ = cheerio.load(indexHtml);

        // Find the <a> tag with id="bookmarklet-link"
        const bookmarkletLink = $('#bookmarklet-link');

        if (bookmarkletLink.length === 0) {
            console.error('❌ Could not find <a id="bookmarklet-link"> in index.html.');
            return;
        }

        // Update the href attribute
        bookmarkletLink.attr('href', bookmarkletCode);
        console.log('✔ Updated <a id="bookmarklet-link"> href attribute with the new bookmarklet code.');

        // Update Version: X.Y.Z
        $('p:contains("Version:")').each((i, elem) => {
            const text = $(elem).text();
            const newText = text.replace(/Version:\s*\d+\.\d+\.\d+/, `Version: ${version}`);
            $(elem).text(newText);
            console.log(`✔ Updated version number in index.html to ${version}.`);
        });

        // Update Last Updated: <date and time>
        $('p:contains("Last Updated:")').each((i, elem) => {
            const text = $(elem).text();
            const newText = text.replace(/Last Updated:\s*[^<]+/, `Last Updated: ${lastUpdated}`);
            $(elem).text(newText);
            console.log(`✔ Updated last updated date in index.html to ${lastUpdated}.`);
        });

        // Get the modified HTML
        const modifiedHtml = $.html();

        // Save the updated index.html
        fs.writeFileSync(indexPath, modifiedHtml, 'utf8');
        console.log('✔ index.html has been updated with the latest version, date, and bookmarklet code.');

        // Start a local server
        const PORT = 8080;
        const server = http.createServer((req, res) => {
            let parsedUrl = url.parse(req.url);
            let pathname = `.${parsedUrl.pathname}`;
            const ext = path.parse(pathname).ext || '.html';
            const mimeType = mime.lookup(ext) || 'application/octet-stream';

            fs.exists(pathname, function (exist) {
                if (!exist) {
                    // If the file is not found, return 404
                    res.statusCode = 404;
                    res.end(`File ${pathname} not found!`);
                    return;
                }

                // If the path is a directory, serve index.html
                if (fs.statSync(pathname).isDirectory()) {
                    pathname += '/index.html';
                }

                // Read file from the file system
                fs.readFile(pathname, function (err, data) {
                    if (err) {
                        res.statusCode = 500;
                        res.end(`Error getting the file: ${err}.`);
                    } else {
                        // If the file is found, set Content-type and send data
                        res.setHeader('Content-type', mimeType);
                        res.end(data);
                    }
                });
            });
        });

        server.listen(PORT, () => {
            console.log(`✔ Server is listening on http://localhost:${PORT}`);

            // Open the browser window after the server starts
            const localURL = `http://localhost:${PORT}`;
            let startCommand;
            switch (process.platform) {
                case 'darwin':
                    startCommand = `open ${localURL}`;
                    break;
                case 'win32':
                    startCommand = `start ${localURL}`;
                    break;
                case 'linux':
                    startCommand = `xdg-open ${localURL}`;
                    break;
                default:
                    console.log('Cannot open browser automatically. Please open the site manually.');
                    return;
            }
            exec(startCommand, (error) => {
                if (error) {
                    console.error('❌ Error opening browser:', error);
                } else {
                    console.log('✔ Browser opened successfully.');
                }
            });
        });

    } catch (error) {
        console.error('❌ Error during deployment:', error);
    }
}

// Execute the deploy function
deploy();
