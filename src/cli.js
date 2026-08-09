#!/usr/bin/env node

import { clean, asyncClean } from "./main.js";

/**
 * Show help information in the console.
 */
function showHelp() {
    const helpMessage = `Link Cleaner CLI
Usage: linkcleaner [options...] <url>

 -u, --unshorten       Un-shorten the URL first, required for some links
 -s, --ytshorts        Convert YouTube Shorts to regular video links
 -m, --ytmusic         Convert YouTube Music links to regular YouTube
 -y, --ytshorten       Shorten all YouTube links to youtu.be URLs
 -t, --twitter         Convert Twitter/X links to FxEmbed links
 -b, --bluesky         Convert Bluesky links to FxEmbed links
 -h, --help            Show this help page

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
        fixBluesky: (argList.includes("-b") || argList.includes("--bluesky") || false)
    }
    if (argList.includes("-h") || argList.includes("--help")) {
        // Show help
        showHelp();
    } else if (argList.includes("-u") || argList.includes("--unshorten")) {
        // Unshorten and clean the link
        const link = await asyncClean(inputLink, options);
        console.log(link.toString());
    } else if (inputLink) {
        // Clean the link without unshortening
        const link = clean(inputLink, options);
        console.log(link.toString());
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