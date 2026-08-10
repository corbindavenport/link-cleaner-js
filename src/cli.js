#!/usr/bin/env node

import { clean, cleanAsync } from "./main.js";

// Headers to use for GET requests, simulating a Google Chrome desktop web browser
const reqHeaders = new Headers({
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'max-age=0',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
    // User Agent Client Hints
    'Sec-Ch-Ua': '"Not=A?Brand";v="99", "Google Chrome";v="151", "Chromium";v="151"',
    'Sec-Ch-Ua-Arch': '"x86"',
    'Sec-Ch-Ua-Bitness': '"64"',
    'Sec-Ch-Ua-Full-Version': '"151.0.7922.109"',
    'Sec-Ch-Ua-Full-Version-List': '"Not=A?Brand";v="99.0.0.0", "Google Chrome";v="151.0.7922.109", "Chromium";v="151.0.7922.109"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Model': '""',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Ch-Ua-Platform-Version': '"19.0.0"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
});

/**
 * Show help information in the console.
 */
function showHelp() {
    const helpMessage = `Link Cleaner CLI
Usage: linkcleaner [options...] <url>

 -u, --unshorten   Un-shorten the URL first, required for some links
 -s, --ytshorts    Convert YouTube Shorts to regular video links
 -m, --ytmusic     Convert YouTube Music links to regular YouTube
 -y, --ytshorten   Shorten all YouTube links to youtu.be URLs
 -t, --twitter     Convert Twitter/X links to FxEmbed links
 -b, --bluesky     Convert Bluesky links to FxEmbed links
 -h, --help        Show this help page

More info: https://github.com/corbindavenport/link-cleaner-js
`;
    console.log(helpMessage);
}

/**
* Reads input from STDIN if no URL was provided via CLI args.
* @returns {Promise<string|null>} The input link or null if no input found.
*/
function readInputFromStdin() {
    return new Promise(function (resolve) {
        let dataBuffer = '';
        // Check if standard input is actually available/piped
        if (!process.stdin.isTTY && process.stdin.readableFlowing) {
            process.stdin.on('data', (chunk) => {
                dataBuffer += chunk.toString();
            });
            // Resolve the promise once the stream ends (EOF reached, typical for pipes)
            process.stdin.on('end', () => {
                const cleanedLink = dataBuffer.trim();
                resolve(cleanedLink || null);
            });
            // Handle potential errors during reading
            process.stdin.on('error', (err) => {
                console.error("Error reading piped input:", err);
                resolve(null);
            });
        } else {
            // If not in a pipe/TTY environment, treat it as no input from stdin
            resolve(null);
        }
    });
};

/**
 * Main function
 */
async function main() {
    let stdin = process.openStdin();
    let inputLink;
    let argList = [];
    // Find input URL and all parameters
    for (const arg of process.argv) {
        if (arg.trim().startsWith("http")) {
            inputLink = arg;
        } else if (arg.trim().startsWith("-")) {
            argList.push(arg);
        }
    }
    // Check if URL is from input pipe
    if (!process.stdin.isTTY && process.stdin.readableFlowing) {
        const pipeInput = await readInputFromStdin();
        if (pipeInput) {
            inputLink = pipeInput;
        }
    }
    // Parse the options
    let options = {
        convertYouTubeShorts: (argList.includes("-s") || argList.includes("--ytshorts") || false),
        convertYouTubeMusic: (argList.includes("-m") || argList.includes("--ytmusic") || false),
        shortenYouTube: (argList.includes("-y") || argList.includes("--ytshorten") || false),
        fixTwitter: (argList.includes("-t") || argList.includes("--twitter") || false),
        fixBluesky: (argList.includes("-b") || argList.includes("--bluesky") || false),
        headers: reqHeaders
    }
    if (argList.includes("-h") || argList.includes("--help")) {
        // Show help
        showHelp();
    } else if (argList.includes("-u") || argList.includes("--unshorten")) {
        // Unshorten and clean the link
        try {
            const link = await cleanAsync(inputLink, options);
            console.log(link.toString());
        } catch (e) {
            console.log(e.message);
            process.exit(1);
        }
    } else if (inputLink) {
        // Clean the link without unshortening
        try {
            const link = clean(inputLink, options);
            console.log(link.toString());
        } catch (e) {
            console.log(e.message);
            process.exit(1);
        }
    } else {
        showHelp();
    }
}

// Listen for termination signals
const gracefulShutdown = function () {
    process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Start main process
await main();
gracefulShutdown();