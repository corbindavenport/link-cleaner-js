#!/usr/bin/env node

import { clean } from "./main.js";

/**
 * Get the list of arguments from command line and parse them as an object.
 * @returns {object}
 */
function getArgs() {
    const array = process.argv;
    const result = {};
    for (let i = 0; i < array.length; i++) {
        const currentItem = array[i];
        if (currentItem.startsWith('-')) {
            // Remove all leading dashes
            const cleanKey = currentItem.replace(/^-+/, '');
            // Get the value and store it
            const nextValue = array[i + 1];
            result[cleanKey] = nextValue;
        } else {
            // If there's an argument without a leading dash, assume it's the input URL
            result["i"] = currentItem;
        }
    }
    return result;
}

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
function main() {
    const args = getArgs();
    if (args.hasOwnProperty("help")) {
        // Print help if requested
        showHelp();
    } else if (args?.i) {
        const link = clean(args.i).toString();
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
main();
gracefulShutdown();