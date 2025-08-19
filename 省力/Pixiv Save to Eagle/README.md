english | [![Static Badge](https://img.shields.io/badge/lang-zh_tw-green)](https://github.com/Max46656/EverythingInGreasyFork/blob/main/%E7%9C%81%E5%8A%9B/README.zh-Hant.md)

# Pixiv Save to Eagle

Save Pixiv images and animations (GIFs) directly to Eagle from artwork pages.

## Features
- Save single images, multi-page images, or GIF animations (Ugoira) to Eagle with one click.
- Automatically fetch artwork metadata (artist name, title, ID) for consistent file naming.
- Add Pixiv tags to Eagle items for better organization.
- Select Eagle folders via a dropdown menu, with the last selected folder saved for convenience.
- Handle Pixiv's dynamic loading to ensure compatibility with artwork pages.
- Error handling for failed downloads or Eagle API issues, with console logging for debugging.

## Installation
1. Install Violentmonkey (available for Firefox, Chrome, Vivaldi, etc.).
2. Install [Pixiv Save to Eagle](https://greasyfork.org/scripts/XXXXXX-pixiv-save-to-eagle) (will load in the userscript manager installed above).
3. Ensure Eagle is running on your local machine (default API: http://localhost:41595).
4. Done.

## Usage
1. Open any Pixiv artwork page (e.g., https://www.pixiv.net/artworks/*).
2. Wait for the "Save to Eagle" button and folder dropdown to appear next to the share button.
3. Select a folder from the dropdown (optional; defaults to Eagle's root).
4. Click "Save to Eagle" to send the artwork (single image, multi-page images, or GIF) to Eagle.
5. Check the browser console for success or error messages.

## Notes
- **Eagle Requirement**: Eagle must be running locally with its API enabled (http://localhost:41595).
- **GIF Processing**: GIFs are generated client-side using gif.js, which may take time for artworks with many frames. Ensure the Pixiv page remains in view during processing.
- **Network Restrictions**: The script uses Pixiv’s API with proper Referer headers to bypass restrictions. Do not open developer tools or resize the window during execution, as this may interrupt dynamic loading.
- **Folder Selection**: The script fetches Eagle folder names dynamically. If no folders are listed, check if Eagle’s API is accessible.
- **Error Handling**: If saving fails (e.g., Eagle offline or Pixiv API changes), errors are logged to the console for debugging.
