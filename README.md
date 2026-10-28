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
- Local progress saving, JSON export/import (including imported questions)
- Import questions from TXT/MD, text-based PDF, DOCX, and image files using in-browser extraction/OCR libraries
- Review/edit extracted question JSON before importing; duplicate titles are skipped
- Select questions and print suggested answers or save as PDF; explanations and notes are omitted by default
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

## Import and print questions
Open “Import questions from documents or photos,” choose one or more PDF, DOCX, TXT/MD, or image files, review the extracted JSON, then select “Import reviewed questions.” PDF, Word, and image processing loads browser libraries from CDNs and therefore needs an internet connection. OCR and question detection can be imperfect; always review the extracted questions and answers before importing. Scanned PDFs may need to be uploaded as page images. Imported questions are saved in this browser and included in the progress export. Use “Print selected questions” to print selected questions with suggested answers, or choose Save as PDF in the print dialog.

## Browser notes
Text-to-speech is broadly available in modern browsers. Speech recognition support varies by browser and platform; if unavailable, type the answer or use device keyboard dictation. Microphone permission requires a secure context such as HTTPS or localhost.

## Customization
Edit `questions.js` to add or update questions. Edit `styles.css` for visual design.


## AI answer grading (optional secure backend)

The app includes a “Rate my answer” panel. It needs a separately deployed backend; GitHub Pages cannot safely hold an AI provider secret. The starter Cloudflare Worker is in `worker/ai-grader.js`.

1. In Cloudflare, create a Worker and paste the contents of `worker/ai-grader.js`.
2. In the Worker settings, add a secret named `OPENAI_API_KEY` containing your OpenAI API key. Do not add the key to this GitHub repository or to the browser app.
3. Deploy the Worker and copy its HTTPS URL.
4. Open Mr Coach, select **Set up AI grading**, and paste the Worker URL. This setting is stored locally in that browser; repeat on another device if needed.
5. Type or dictate an answer and select **Rate my answer**.

The Worker sends the question and answer to the OpenAI API for evaluation. API usage may incur charges under your provider account. Review your provider's current pricing and privacy terms before use. Scores are practice feedback, not an objective hiring assessment. Keep answers free of sensitive personal information.
