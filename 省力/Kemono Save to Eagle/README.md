[![Static Badge](https://img.shields.io/badge/lang-zh_tw-green)](https://github.com/Max46656/EverythingInGreasyFork/tree/main/%E7%9C%81%E5%8A%9B/Kemono%20Save%20to%20Eagle/README.zh-Hant.md)

# Kemono Save to Eagle

Save images from Kemono posts directly to Eagle with customizable button placement.

## Features
- Save individual images from Kemono posts to Eagle with one click per image.
- Automatically fetch post metadata (artist name, title, ID) for consistent file naming.
- Select Eagle folders via a dropdown menu, with the last selected folder saved for convenience.
- Add a "Save All to Eagle" button to download all images in a post at once.
- Customize the position of "Save to Eagle" buttons (e.g., top-left, bottom-right, center) via a user menu.
- Handle Kemono's dynamic loading to ensure buttons appear on post pages.
- Error handling for failed downloads or Eagle API issues, with console logging for debugging.

## Installation
1. Install [Violentmonkey](https://github.com/violentmonkey/violentmonkey) (available for Firefox, Chrome, Vivaldi, etc.).
2. Install [Kemono Save to Eagle](https://greasyfork.org/zh-TW/scripts/552924-kemono-save-to-eagle) (will load in the userscript manager installed above).
3. Ensure Eagle is running on your local machine (default API: http://localhost:41595).
4. Done.

## Usage
1. Open any Kemono post page (e.g., https://kemono.su/*/user/*/post/*).
2. Wait for the "Save to Eagle" buttons to appear on each image and the folder dropdown near the post files section.
3. Select a folder from the dropdown (optional; defaults to Eagle's root).
4. Click a "Save to Eagle" button on an image to send it to Eagle, or use the "Save All to Eagle" button to download all images in the post.
5. Use the userscript menu (via Violentmonkey) to select the button position (e.g., top-left, center-top) and confirm with the "⭘" button.
6. Check the browser console for success or error messages.

## Notes
- **Eagle Requirement**: Eagle must be running locally with its API enabled (http://localhost:41595).
- **Dynamic Loading**: The script monitors DOM changes to ensure buttons appear even on dynamically loaded content. Avoid opening developer tools or resizing the window during execution, as this may interrupt loading.
- **Button Positioning**: Use the "選擇按鈕位置" (Select Button Position) menu to customize where "Save to Eagle" buttons appear on images (e.g., corners or center).
- **Folder Selection**: The script fetches Eagle folder names dynamically. If no folders are listed, check if Eagle’s API is accessible.
- **Error Handling**: If saving fails (e.g., Eagle offline or Kemono API changes), errors are logged to the console for debugging.
- **Performance**: Saving multiple images at once (via "Save All to Eagle") may take time depending on the number of images and network conditions.
