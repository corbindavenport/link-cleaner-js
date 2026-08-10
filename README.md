# Link Cleaner JS & Link Cleaner CLI

[Link Cleaner JS](#how-to-install-the-js-library) is a JavaScript library for removing tracking identifiers, extra parameters, and other unnecessary data from URLs. In some environments, it can also un-shorten a link and retrieve the original version of a Google AMP page.

[Link Cleaner CLI](#how-to-install-the-cli) is a command-line application that uses the JavaScript library in a Node.js runtime, allowing you to clean and un-shorten links on any Windows, macOS, or Linux system. It can be used in a terminal, or easily integrated into Bash scripts and other automations.

This library is primarily built for the [Link Cleaner web app](https://github.com/corbindavenport/link-cleaner).

**This is a work in progress!**

![NPM version](https://img.shields.io/npm/v/link-cleaner-js) ![NPM weekly downloads](https://img.shields.io/npm/dw/link-cleaner-js) ![NPM downloads for all time](https://img.shields.io/npm/d18m/link-cleaner-js)

## How to install the CLI

Link Cleaner CLI works on Windows, macOS, and Linux with the Node.js runtime.

### Windows

Press the `Win + X` keyboard shortcut, and select Windows PowerShell (Admin) or Terminal (Admin). Next, copy the below command, paste it into the window (Ctrl+V), and press the Enter/Return key:

```ps
winget install -e --id OpenJS.NodeJS.LTS
```

Open a new PowerShell Admin window or Terminal tab, then run this command:

```sh
npm install -g link-cleaner-js
```

If you get an error that running scripts is disabled, use this command to allow signed scripts, then try the install command again:

```sh
Set-ExecutionPolicy RemoteSigned
```

You can run `linkcleaner -help` to verify Link Cleaner is installed.

### Linux

The process for installing Node.js and NPM varies by distribution. Here's how to do it on Ubuntu-like distros:

```sh
sudo apt install nodejs npm
```

Then, install Link Cleaner from NPM:

```sh
npm install -g link-cleaner-js
```

You can run `linkcleaner -h` to verify Link Cleaner is installed.

### macOS

Install the [Homebrew package manager](https://brew.sh), then open a new Terminal window/tab and run this command to install Node.js and NPM:

```
brew install node
```

Then, install Link Cleaner from NPM:

```sh
npm install -g link-cleaner-js
```

You can run `linkcleaner -h` to verify Link Cleaner is installed.

## How to use the CLI

The basic usage is running the `linkcleaner` command with the URL in quotes, like this:

```sh
linkcleaner "https://youtu.be/wAUK9hVgmNI?si=d5DS29nU8fOzWfqP&t=2"
```

You can use additional options, like `-b` or `--bluesky` to convert Bluesky posts into FixEmbed links:

```sh
linkcleaner -b "https://bsky.app/profile/corbin.io/post/3mry2hm5qps2y"
```

For un-shortening links, like `bit.ly` URLs or Reddit's `/s` post links, use the `-u` or `--unshorten` options:

```sh
linkcleaner -u "https://www.reddit.com/r/vscode/s/y8wM23uuT3"
```

You can also use pipes. This example on macOS will read a URL from the clipboard, unshorten and clean it, then copy the result to the clipboard:

```sh
pbpaste | linkcleaner -u | pbcopy
```

Run `linkcleaner -h` to see all available options.

## How to install the JS library

The Link Cleaner library is an extension of the [native URL interface](https://developer.mozilla.org/en-US/docs/Web/API/URL), so it's a small package (~4KB minified) and has no dependencies.

For local project installation, you can use NPM:

```
npm install link-cleaner-js
```

For static web pages or web apps, copy the `linkcleaner.js` or `linkcleaner.min.js` scripts in the `dist` directory to your project, or use a CDN like this:

```html
<script src="https://unpkg.com/link-cleaner-js@0.2.0/dist/linkcleaner.min.js"></script>
```

## How to use the JS library

First, import the library in your script, using `require` for CommonJS projects or `import` for ES Modules projects:

```js
// CommonJS
const linkCleaner = require("link-cleaner-js");
// ES Modules
import * as linkCleaner from "link-cleaner-js";
```

For a regular web page or web app, you just need `linkcleaner.js` or `linkcleaner.min.js` in a script tag placed before your main script in the HTML structure, then call it with `linkCleaner.clean()`. 

The basic `clean()` function accepts either a string or a URL object:

```js
let urlObj = new URL("http://example.com?a=123");
let cleaned = linkCleaner.clean(urlObj);

let urlString = "http://example.com?a=123";
let cleaned = linkCleaner.clean(urlString);
```

The output is always a new URL object. You can convert it to a string afterwards, if needed:

```js
let link = linkCleaner.clean("http://example.com?a=123");
let linkStr = link.toString();
```

You can pass options to it in the second parameter, like this:

```js
let link = linkCleaner.clean("https://music.youtube.com/watch?v=Gyk5F5gYKzY", {
    convertYouTubeMusic: true
    shortenYouTube: true
})
```

There is also a `cleanAsync()` function, which attempts to un-shorten the input URL first, then cleans the result. It's a Promise function that must be called with `await`, since it makes a GET request to the target URL.

This mode is required for `bit.ly` URLs, Reddit's `/s` post links, and other URLs that completely obscure the destination:

```js
let link = linkCleaner.clean("https://www.reddit.com/r/vscode/s/y8wM23uuT3");
// Output: https://www.reddit.com/r/vscode/s/y8wM23uuT3

let link = await linkCleaner.cleanAsync("https://www.reddit.com/r/vscode/s/y8wM23uuT3");
// Output: https://www.reddit.com/r/vscode/comments/1uxx68q/visual_studio_code_1129_release_notes/
```

This will not work in a standard web browser due to [CORS restrictions](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS). It still works in a Node.js project, the background script of a WebExtension (with[host_permissions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/host_permissions) set to `<all_urls>`), and other runtimes that don't enforce CORS.