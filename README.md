# BGG Plugin for Obsidian

This is a plugin for Obsidian that allows you to search BoardGameGeek directly within Obsidian and save the details of a game as a new note.

## Features

- Search BoardGameGeek from within Obsidian.
- Save game details as a new note in Obsidian.
- Translate comments into a specified language using Google Translate API.

## How to Use

1. Install the plugin in Obsidian.
2. Use the command palette (`Ctrl+P` or `Cmd+P` on Mac) to run the `Search BoardGameGeek` command.
3. Enter your search query in the search input field that appears.
4. Press `Enter` to perform the search.
5. Click on a result to save the game details as a new note.

## Settings

You can configure the following settings for the plugin:

- `notePath`: The path where the game details will be saved.
- `Enable Translation`: Whether to enable translation of comments.
- `API Key`: Your Google Translate API key.
- `Translation Language`: The target language for translation (e.g., "zh-TW" for Traditional Chinese).

here are the language codes for some commonly used languages:

- English: `en`
- Spanish: `es`
- French: `fr`
- German: `de`
- Italian: `it`
- Portuguese: `pt`
- Russian: `ru`
- Japanese: `ja`
- Korean: `ko`
- Simplified Chinese: `zh-CN`
- Traditional Chinese: `zh-TW`
- Arabic: `ar`

## Translation Feature

The plugin can translate comments into a specified language using the Google Translate API. To use this feature, you need to enable translation in the settings and provide your Google Translate API key and the target language for translation.

## How to Get a Google Translate API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing project.
3. Navigate to the `APIs & Services > Library` page.
4. Search for "Google Cloud Translation API" and enable it for your project.
5. Navigate to the `APIs & Services > Credentials` page.
6. Click `Create credentials > API key`.
7. Copy the API key and paste it into the `API Key` field in the plugin settings in Obsidian.

Please note that the Google Translate API is a paid service. You can check the [pricing details](https://cloud.google.com/translate/pricing) on the Google Cloud website.
