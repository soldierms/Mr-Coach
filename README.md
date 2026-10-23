# Interview Coach — Platform & DevOps

A responsive, installable web app for Mac and phone. Includes 18 question titles from the located interview PDF plus 12 additional Platform/DevOps questions tailored to the user's stated experience. The original PDF's sample answers have been rewritten to align with the user's background; they are practice drafts, not claims to repeat if they don't match real experience.

## Features
- Responsive layout for Mac, tablet, and phone
- 30-question bank, topic filters, and search
- Learn, Speak, and Mock Interview modes
- Browser text-to-speech and speech recognition where supported
- 60-second practice timer
- Suggested answers, simple explanations, examples, and follow-up questions
- Notes, confidence ratings, practiced/mastered tracking
- Local progress saving, JSON export/import
- PWA manifest and service worker for install/offline use when served over HTTPS or localhost

## Run on your Mac
1. Unzip the package.
2. Open Terminal and `cd` into the `technical-interview-coach` folder.
3. Run `python3 -m http.server 8000`
4. Open `http://localhost:8000` in your Mac browser.

## Use it on your phone
To install and use it like an app on your phone, host this folder on a secure HTTPS static host (for example GitHub Pages, Netlify, or Cloudflare Pages), then open the URL on your phone:
- iPhone: Safari → Share → Add to Home Screen
- Android: Chrome → menu → Install app / Add to Home screen

A local `localhost` URL on your Mac is not automatically accessible from your phone. If you want the same progress on both devices, use the Export progress / Import progress buttons for now; progress is stored locally per browser and does not automatically sync. Cross-device sync would need a backend or account service.

## Browser notes
Text-to-speech is broadly available in modern browsers. Speech recognition support varies by browser and platform; if unavailable, type the answer or use device keyboard dictation. Microphone permission requires a secure context such as HTTPS or localhost.

## Customization
Edit `questions.js` to add or update questions. Edit `styles.css` for visual design.
