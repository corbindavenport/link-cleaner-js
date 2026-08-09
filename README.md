# Link Cleaner JS & Link Cleaner CLI

Link Cleaner JS is a JavaScript library for removing tracking identifiers, extra parameters, and other unnecessary data from URLs. In some environments, it can also un-shorten a link and retrieve the original version of a Google AMP page.

This package also includes a command-line interface for cleaning URLs, using the Node.js runtime on Windows, macOS, and Linux. The library is primarily designed for the [Link Cleaner web app](https://github.com/corbindavenport/link-cleaner).

**This is a work in progress!**

![Link Cleaner NPM version](https://img.shields.io/npm/v/link-cleaner-js) ![Link Cleaner download count](https://img.shields.io/npm/d18m/link-cleaner-js)

## How to install Link Cleaner CLI

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

## How to use Link Cleaner CLI

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

You can also pipe the input URL, like this:

```sh
echo "http://example.com?a=123" | linkcleaner
```

Run `linkcleaner -h` to see all available options.

## How to use Link Cleaner JS

The Link Cleaner library is an extension of the [native JS URL interface](https://developer.mozilla.org/en-US/docs/Web/API/URL). You can pass it a link as either a string or a URL object:

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

There is also an `cleanAsync` function, which attempts to un-shorten the input URL first, then cleans the result. This is required for `bit.ly` URLs, Reddit's `/s` post links, and other URLs that completely obscure the destination:

```js
let link = linkCleaner.clean("https://www.reddit.com/r/vscode/s/y8wM23uuT3");
// Output: https://www.reddit.com/r/vscode/s/y8wM23uuT3

let link = linkCleaner.cleanAsync("https://www.reddit.com/r/vscode/s/y8wM23uuT3");
// Output: https://www.reddit.com/r/vscode/comments/1uxx68q/visual_studio_code_1129_release_notes/
```

The `cleanAsync` function requires a GET request to the URL, so it will not work in a standard web browser due to [CORS restrictions](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS). You can use it in a WebExtension (with permissions for the input domain) or Node project, though.