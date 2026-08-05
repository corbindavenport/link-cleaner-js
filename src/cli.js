#!/usr/bin/env node

import { clean, asyncClean } from "./main.js";

/**
 * Show help information in the console.
 */
function showHelp() {
    const helpMessage = `Not implemented yet!`;
    console.log(helpMessage);
}

/**
 * Main function
 */
async function main() {
    let inputLink;
    let argList = [];
    for (const arg of process.argv) {
        if (arg.trim().startsWith("http")) {
            inputLink = arg;
        } else if (arg.trim().startsWith("-")) {
            argList.push(arg);
        }
    }
    if (argList.includes("-h") || argList.includes("--help")) {
        // Show help
        showHelp();
    } else if (argList.includes("-u") || argList.includes("--unshorten")) {
        // Unshorten and clean the link
        const link = await asyncClean(inputLink);
        console.log(link.toString());
    } else if (inputLink) {
        // Clean the link without unshortening
        const link = clean(inputLink).toString();
        console.log(link);
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