# Book Story

책으로 만나는 취향. 책 제목·저자·추천 이유를 나누는 책 추천/독서 감상 커뮤니티입니다. 책 파일, 전문, 스캔본을 배포하는 서비스가 아닙니다.

- Website: https://dohoon819.github.io/book-story/
- Stack: static HTML/CSS/ES modules on GitHub Pages; bundled nostr-tools 2.26.0.
- No advertising, fake users, or seeded posts.

## Features

Sage-green and beige responsive interface; Korean/English interface; topic filters; search and sorting; browser-local bookmarks; own-post view; vertical swipe/scroll reader; optional photo upload (JPG/PNG/WebP/GIF, up to 8 MB); spoilers; public hearts, mutually exclusive like/dislike, comments, author-only deletion; exact-ID share links; browser-local drafts; author key backup/restore; local author hiding.

## Public data and identity

This is a public, decentralized community prototype, not a privately managed database. All posts, profiles, reactions and comments are signed in the visitor's browser and sent to the public relays in config.js. Photos are uploaded with NIP-98 authorization to the configured external media services. Posts use kind 30023, profiles/reactions kind 30078, comments kind 1, and deletion requests kind 5.

Each site has its own namespace and browser storage prefix. Nothing is written to the Recipe Story community. User-visible feeds contain real visitor posts only; automated tests use isolated local relays or unique verification namespaces.

The browser stores an author key in localStorage. Nicknames are not passwords. Ownership checks compare verified event public keys, not names. Back up the key before clearing browser storage or switching devices. A backup contains an unencrypted private author key and must be kept private. There is no central password reset.

Name checks reject names observed on connected relays, but are not an atomic global username reservation. A short public-key suffix distinguishes authors. Bookmarks, drafts and hidden-author choices are local to each browser.

## Operational limits

- Public relay/media availability and retention are outside the site's control. Permanent storage is not guaranteed.
- Deletion is signed by the owner and hidden in this app, but copies on other relays/clients or photo hosts may remain. See the in-app community guide before posting sensitive content.
- The feed requests the latest 250 posts per relay. Shared links can fetch older posts by exact event ID.
- Post content uses JavaScript and public network requests; only the homepage is listed in sitemap.xml. Search indexing and rankings are not guaranteed.
- There is no central moderation dashboard, global ban system, or server-enforced abuse quota. The app provides local author hiding and publishing guidelines. A larger public launch should add managed moderation, abuse controls and monitored storage.
- Photos are optional. A failed upload or publish leaves the draft intact.
- No service-role key, API secret, or shared account credential is included.

## Development

Requires Node.js 20+ (verified with Node 24). The deployed site has no server-side runtime or build dependency.

    npm ci
    npm run vendor
    npm run check
    npm test

The browser test defaults to Chrome at C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe; set BROWSER_PATH for another installed Chromium executable. No browser binary download is required. Test outputs are ignored by Git.

tests/community.cjs runs a local WebSocket relay and two independent browser contexts. It checks publishing, shared reactions/comments, unique-name checks, ownership, XSS escaping, outage/draft retention, searches, bookmarks, direct links, upload, and responsive readers.

The optional tests/live.cjs requires COMMUNITY_LIVE=1. It writes temporary signed events only to a unique verification namespace and removes its temporary post/comment afterward. It never seeds the normal site feed.

tools/preview.cjs generates social-preview.png from the app's own code-native artwork, not third-party book covers.

## Deployment

GitHub Pages serves the main branch root. Commit and push static assets, including vendor/nostr.js and social-preview.png. .nojekyll prevents Jekyll processing. package-lock.json pins development dependencies.

## Third-party notices

Bundled libraries retain their upstream licenses; see vendor/THIRD_PARTY_LICENSES.txt. Google Fonts are requested with system-font fallbacks. Nostr protocol: https://github.com/nostr-protocol/nips (NIP-01, NIP-09, NIP-98).
