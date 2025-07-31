english | [![Static Badge](https://img.shields.io/badge/lang-zh_tw-green)](https://github.com/Max46656/EverythingInGreasyFork/tree/main/%E7%9C%81%E5%8A%9B/Twitter%20Shortcuts/README.zh-Hant.md)

# Twitter Shortcuts

## Introduction

**Twitter Shortcuts** is a user script designed for the Twitter (now X) platform to enhance user navigation and post interaction efficiency.  
With this script, you can use predefined shortcut key combinations to quickly perform common actions such as returning to the homepage, switching tabs, retweeting, liking posts, and more.  
Additionally, the script allows you to customize shortcut combinations to better suit your personal preferences.  

It can be installed and used via Violentmonkey or other compatible user script managers.

## Features and Shortcut Key Overview

Below is a list of the shortcut functionalities provided by this script, including the purpose of each shortcut, the applicable pages, and the default key combinations. Note that all shortcuts can be customized in the script settings.

| Feature Name | Applicable Pages | Default Shortcut | Description |
| --- | --- | --- | --- |
| Back | `https://x.com/*` | CapsLock + Q | Navigate back to the previous page. |
| Home | `https://x.com/*` | CapsLock + W | Go to the Twitter/X homepage. |
| User Profile | `https://x.com/*` | CapsLock + E | Navigate to your personal profile page. |
| Notifications | `https://x.com/*` | CapsLock + R | Go to your notifications page. |
| Search | `https://x.com/*` | CapsLock + T | Open the Twitter/X search page. |
| Tab 1 | `https://x.com/*` | CapsLock + G | Switch to the first tab in the navigation bar (e.g., "For You" on the homepage or "Posts" on a user profile). |
| Tab 2 | `https://x.com/*` | CapsLock + F | Switch to the second tab in the timeline (e.g., "Following" on the homepage or "Replies" on a user profile). |
| Tab 3 | `https://x.com/*` | CapsLock + D | Switch to the third tab in the timeline (e.g., "Highlights" or "Media" on a user profile, or "People" or "News" on the search page). |
| Tab 4 | `https://x.com/*` | CapsLock + S | Switch to the fourth tab in the timeline (e.g., "Media" or "Articles" on a user profile, or "Media" or "Sports" on the search page). |
| Tab 5 | `https://x.com/*` | CapsLock + A | Switch to the fifth tab in the timeline (e.g., "Media" on a user profile or "Lists" on the search page). |
| Retweet | `https://x.com/*/status/*/photo/*` | CapsLock + V | Retweet or undo a retweet for the current post. |
| Like Post | `https://x.com/*/status/*/photo/*` | CapsLock + C | Like or unlike the current post. |
| Expand Post | `https://x.com/*/status/*/photo/*` | CapsLock + X | Expand or collapse the details of the current post. |
| Follow/Unfollow User | `https://x.com/*` | CapsLock + B | Follow or unfollow the user on the current page. |
| Timeline Refresh | `https://x.com/*` | CapsLock + Z | Manually refresh the timeline to view the latest posts. |
| Go to Original Poster's Profile | `https://x.com/*/status/*` | CapsLock + B | Navigate to the original poster's profile page for the current post. |
| Close Post | `https://x.com/*/status/*/photo/*` | CapsLock + Q | Close the currently viewed post (e.g., a photo or video). |

### Notes

- **Applicable Pages**: Each shortcut only works on the specified URL patterns. For example, shortcuts related to post interactions (e.g., retweet, like post) are only available on specific post pages (e.g., posts containing photos).  
- **CapsLock Combination Keys**: The default shortcuts use `CapsLock` as the prefix key combined with other letter keys. These have higher priority than Twitter/X's built-in shortcuts but lower priority than browser shortcuts.  
- **Customizing Shortcuts**: You can modify shortcut combinations via the script's settings interface. See the "Customizing Shortcuts" section below for details.

## Installation Instructions

1. **Install a User Script Manager**:

   - Install Violentmonkey, Greasemonkey, or another compatible user script manager on your browser.
     - Chrome: Install Violentmonkey
     - Firefox: Install Greasemonkey
     - Other browsers: Ensure compatibility with user script managers.

2. **Install the Script**:

   - Visit the [script release page](https://greasyfork.org/en/scripts/543615-twitter-shortcuts) to download the script.
   - Click the "Install" button, and your script manager will automatically recognize and install it.

3. **Verify Installation**:

   - After installation, visit `https://x.com`, and the script will take effect automatically.
   - You can check the browser console (open Developer Tools with F12) to see the script's log messages, confirming whether the rules have loaded successfully.

## Customizing Shortcuts

This script allows you to customize shortcut combinations. Follow these steps:

1. **Open the Script Manager**:

   - Click the Violentmonkey/Greasemonkey icon in your browser and select "Manage Panel."
   - Locate the "Twitter Shortcuts" script and click "Manage Shortcut Rules."

2. **Modify Shortcut Rules**:

   - In the script's `twitterRules` array, find the rule you want to modify.
   - Change the `shortcut` property to your desired key combination (e.g., change `"CapsLock+Q"` to `"Ctrl+Shift+Q"`).
   - Supported keys include: `Ctrl`, `Alt`, `Shift`, `CapsLock`, `NumLock`, and combinations with other keys.

3. **Save and Reload**:

   - Save your changes and reload the Twitter/X page. The new shortcut combination will take effect immediately.

## Dependencies

This script relies on an external shortcut library:

- **Shortcut Library**: `https://greasyfork.org/en/scripts/542910-shortcut-library`

Ensure your script manager allows loading external resources; otherwise, the script may not function properly.

## Notes

- **Compatibility**: This script is designed for Twitter/X's latest interface (as of July 2025). If the platform's interface is updated, please report any need to adjust CSS selectors or URL patterns.
- **Conflict Issues**: If shortcuts conflict with other scripts or browser functions, try modifying the shortcut combinations.
- **Log Messages**: The script outputs success or failure messages for rule additions in the console, aiding in debugging.

## Issue Reporting

If you encounter issues or have suggestions for improvement, please visit the GitHub repository to submit an Issue or contact the author.

## License

This script is licensed under the **MPL 2.0**, allowing free modification and sharing, provided you comply with the license terms.
