/**
 * @typedef {Object} LinkSettings
 * @property {boolean} [convertYouTubeShorts] - If YouTube Shorts links should be converted to regular YouTube video links.
 * @property {boolean} [convertYouTubeMusic] - If YouTube Music (music.youtube.com) links should be converted to regular YouTube (youtube.com) links.
 * @property {boolean} [shortenYouTube] - If YouTube links should be shortened to the youtu.be/wAUK9hVgmNI format. This also applies to YouTube Shorts if `convertYouTubeShorts` is `true`, and music tracks and episodes from YouTube Music if `convertYouTubeMusic` is `true`.
 * @property {boolean} [fixTwitter] - If posts from Twitter/X should be converted to FxEmbed links. More information: https://github.com/FxEmbed/FxEmbed
 * @property {boolean} [fixBluesky] - If posts from Bluesky should be converted to FxEmbed links. More information: https://github.com/FxEmbed/FxEmbed
 * @property {string} [amazonId] - The Amazon affiliate tracking ID added to the end of any Amazon store links. More information: https://affiliate-program.amazon.com/help/node/topic/GK5TZZ4AWML2QSLA
 */

/**
 * Defines the standardized output structure.
 * @typedef {Object} CleanedLinkOutput
 * @property {string} urlString - The cleaned URL as a string.
 * @property {URL} urlObject - The cleaned URL as a native JavaScript URL object.
 */

// List of YouTube and YouTube Music domains
const youtubeDomains = [
    "www.youtube.com",
    "youtube.com",
    "m.youtube.com",
    "music.youtube.com",
    "youtu.be"
];

/**
 * Cleans a link with the provided settings.
 * @param {string | URL} link - The URL input, either as a string or a URL object.
 * @param {LinkSettings} [linkSettings] - Settings for cleaning the link.
 * @returns {URL} The cleaned link as a URL object. Use `.toString()` afterwards to get the full string.
 */
export function clean(link, linkSettings) {
    let oldLink;
    if (typeof link === 'object' && link !== null && 'href' in link) {
        oldLink = link;
    } else if (typeof link === 'string') {
        try {
            oldLink = new URL(link);
        } catch (e) {
            throw new Error("No valid URL found in string.");
        }
    } else {
        throw new TypeError("Input must be a string or a URL object.");
    }
    // Fixes for various link shorteners
    if ((oldLink.host === 'l.facebook.com') && oldLink.searchParams.has('u')) {
        // Fix for Facebook shared links
        var facebookLink = decodeURI(oldLink.searchParams.get('u'));
        oldLink = new URL(facebookLink);
    } else if ((oldLink.host === 'href.li')) {
        // Fix for href.li links
        var hrefLink = oldLink.href.split('?')[1];
        oldLink = new URL(hrefLink);
    } else if ((oldLink.host === 'www.google.com') && (oldLink.pathname === '/url') && (oldLink.searchParams.has('url'))) {
        // Fix for redirect links from Google Search (#29)
        oldLink = new URL(oldLink.searchParams.get('url'));
    } else if ((oldLink.host === 'cts.businesswire.com') && oldLink.searchParams.has('url')) {
        // Fix BusinessWire external link redirects
        oldLink = new URL(oldLink.searchParams.get('url'));
    }
    // Generate new link
    var newLink = new URL(oldLink.origin + oldLink.pathname);
    // Don't remove 'q' parameter
    if (oldLink.searchParams.has('q')) {
        newLink.searchParams.append('q', oldLink.searchParams.get('q'));
    }
    // Site-specific overrides
    if ((oldLink.host === 'play.google.com') && oldLink.searchParams.has('id')) {
        // Don't remove ID parameter for Google Play links
        // Example: https://play.google.com/store/apps/details?id=com.microsoft.outlooklite
        newLink.searchParams.append('id', oldLink.searchParams.get('id'));
    } else if ((oldLink.host === 'www.macys.com') && oldLink.searchParams.has('ID')) {
        // Don't remove ID parameter for Macy's links
        // Example: https://www.macys.com/shop/product/anthony-veer-mens-roosevelt-ii-double-monk-strap-goodyear-welt-dress-shoe?ID=10920481
        newLink.searchParams.append('ID', oldLink.searchParams.get('ID'));
    } else if (youtubeDomains.includes(oldLink.host)) {
        // Regex to find video ID in a YouTube URL, demo: https://regex101.com/r/0Plpyd/1
        const youtubeRegex = /^.*(youtu\.be\/|embed\/|shorts\/|\?v=|\&v=)(?<videoID>[^#\&\?]*).*/;
        // Restore video parameter on YouTube links
        if (oldLink.searchParams.has('v')) {
            newLink.searchParams.append('v', oldLink.searchParams.get('v'));
        }
        // Restore time parameter on YouTube links
        if (oldLink.searchParams.has('t')) {
            newLink.searchParams.append('t', oldLink.searchParams.get('t'));
        }
        // Restore list ID for YouTube playlist links
        if (oldLink.pathname.includes('playlist') && oldLink.searchParams.has('list')) {
            newLink.searchParams.append('list', oldLink.searchParams.get('list'));
        }
        // Convert YouTube Shorts links to regular video links, if the setting is enabled (#60)
        if (oldLink.pathname.startsWith("/shorts/") && linkSettings?.convertYouTubeShorts) {
            var videoId = youtubeRegex.exec(oldLink.href)['groups']['videoID'];
            newLink = new URL("https://youtube.com/watch?v=" + videoId);
        }
        // Convert YouTube Music links to YouTube links, if enabled
        if (oldLink.host === "music.youtube.com" && linkSettings?.convertYouTubeMusic) {
            newLink.host = "youtube.com"
        }
        // Shorten YouTube video links (or anything already converted to one), if the setting is enabled
        if ((oldLink.searchParams.has('v') || oldLink.pathname.startsWith("/shorts")) && linkSettings?.shortenYouTube) {
            var videoId = youtubeRegex.exec(oldLink.href)['groups']['videoID'];
            newLink = new URL('https://youtu.be/' + videoId);
        }
    } else if ((oldLink.host === 'www.facebook.com') && oldLink.pathname.includes('story.php')) {
        // Don't remove required variables for Facebook links
        newLink.searchParams.append('story_fbid', oldLink.searchParams.get('story_fbid'));
        newLink.searchParams.append('id', oldLink.searchParams.get('id'));
    } else if (oldLink.host.includes('amazon')) {
        // Remove extra information for Amazon shopping links
        // Amazon has a lot of country-specific domains that are subject to change, so this just matches "amazon" along with a known product URL path
        if (oldLink.pathname.includes('/dp/') || oldLink.pathname.includes('/d/') || oldLink.pathname.includes('/product/')) {
            newLink.hostname = newLink.hostname.replace('www.', '');
            // Find product ID
            var regex = /(?:\/dp\/|\/product\/|\/d\/)(\w*|\d*)/g;
            var match = regex.exec(oldLink.pathname);
            if (match && match[1]) {
                newLink.pathname = '/dp/' + match[1];
            }
        }
        // Add Amazon affiliate code if enabled
        if (linkSettings?.amazonId) {
            newLink.searchParams.append('tag', linkSettings.amazonId);
        }
    } else if ((oldLink.host === 'www.lenovo.com') && oldLink.searchParams.has('bundleId')) {
        // Fix Lenovo store bundle links
        newLink.searchParams.append('bundleId', oldLink.searchParams.get('bundleId'));
    } else if ((oldLink.host === 'www.bestbuy.com') && oldLink.pathname.includes('.p')) {
        // Shorten Best Buy product links
        // Example input: https://www.bestbuy.com/site/microsoft-xbox-series-x-2tb-console-galaxy-black-special-edition/6595698.p?skuId=6595698
        var regex = /\/(\d+)\.p/;
        var productID = oldLink.pathname.match(regex);
        if (productID) {
            newLink.pathname = '/site/' + productID[1] + '.p';
        }
    } else if ((oldLink.host === 'www.xiaohongshu.com') && oldLink.searchParams.has('xsec_token')) {
        // Allow Xiaohongshu links to be viewed without an account
        newLink.searchParams.append('xsec_token', oldLink.searchParams.get('xsec_token'));
    } else if (oldLink.host === 'weatherkit.apple.com') {
        // Fix Apple Weather alert links
        newLink.searchParams.append('lang', oldLink.searchParams.get('lang'));
        newLink.searchParams.append('party', oldLink.searchParams.get('party'));
        newLink.searchParams.append('ids', oldLink.searchParams.get('ids'));
    } else if ((oldLink.host === 'www.webtoons.com') && oldLink.searchParams.has('title_no') && oldLink.searchParams.has('episode_no')) {
        // Fix Webtoon links
        newLink.searchParams.append('title_no', oldLink.searchParams.get('title_no'));
        newLink.searchParams.append('episode_no', oldLink.searchParams.get('episode_no'));
    } else if (linkSettings?.fixTwitter && ((oldLink.host === 'twitter.com') || (oldLink.host === 'x.com'))) {
        // Replace Twitter/X links with FxEmbed if enabled
        newLink.host = 'fxtwitter.com';
    } else if (linkSettings?.fixBluesky && ((oldLink.host === 'bsky.app') && (oldLink.pathname.includes('/post/')))) {
        // Replace Bluesky links with FxEmbed if enabled
        newLink.host = 'fxbsky.app';
    } else if ((oldLink.host === 'www.walmart.com') && oldLink.pathname.includes('/ip/')) {
        // Remove extra information for Walmart shopping links
        // Example input: https://www.walmart.com/ip/Lenovo-LOQ-15-6-FHD-144Hz-Gaming-Notebook-Ryzen-7-7435HS-16GB-RAM-512GB-SSD-NVIDIA-GeForce-RTX-4070-Luna-Grey-Octa-Core-Display-Ram/13376108763?classType=REGULAR&athbdg=L1800
        var regex = /\/ip\/.*\/(\d+)/;
        var productID = oldLink.pathname.match(regex);
        if (productID) {
            newLink.pathname = '/ip/' + productID[1];
        }
    }
    // Return the output
    return newLink;
}

/**
 * Follows all redirects for the provided link, then cleans the link with the provided settings. This is required for URLs created by link shorteners like `bit.ly` or `tinyurl.com`, AMP links, or other URLs that completely hide the destination.
 * 
 * This requires a Fetch request to the original URL, so it will not work in environments that enforce Cross-Origin Resource Sharing (CORS).
 * @param {string | URL} link - The URL input, either as a string or a URL object.
 * @param {LinkSettings} [linkSettings] - Settings for cleaning the link.
 * @returns {URL} The cleaned link as a URL object. Use `.toString()` afterwards to get the full string.
 */
export async function asyncClean(link, linkSettings) {
    // Follow network request
    let response, finalLink;
    try {
        response = await fetch(link, { method: "GET" });
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        throw error;
    }
    finalLink = response.url;
    // Try to parse HTML from response for additional checks
    let result = "";
    if (response.headers.get("content-type").toLowerCase().startsWith("text/html")) {
        try {
            result = await response.text();
            // Get the original URL for Accelerated Mobile Pages (AMP)
            // Documentation: https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml
            const ampRegex = /<html ⚡|<html amp/i;
            if (ampRegex.exec(result)) {
                // Find href attribute value in <link rel="canonical"> tag
                const canonicalRegex = /href\s*=\s*(?:["']([^"']*?)["']|([^\s>]+))/i;
                const match = canonicalRegex.exec(result);
                if (match) {
                    finalLink = match[1] || match[2];
                }
            }
        } catch {
            // Fail silently and continue with the original URL
        }
    }
    // Clean the link
    return clean(finalLink, linkSettings);
}