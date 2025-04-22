# Capitals - AI-Powered Paraphrasing and Translation Add-on for Google Docs

This is a Google Docs add-on designed to enhance your writing process by providing AI-powered paraphrasing and translation capabilities. It leverages the power of the Gemini 1.5 Flash API to help you improve the clarity, tone, and originality of your text in real time. This tool is ideal for writers, students, and professionals who need to refine their writing quickly and efficiently.

![Capitals Logo](https://github.com/juankeyboard/Capitals_paraphrase/blob/main/images/Capitals_500px.png?raw=true)

## Features

*   **AI-Driven Paraphrasing:** Rephrase selected text with improved clarity, coherence, and precision while maintaining the original meaning.
*   **Real-Time Translation:** Translate text into English with advanced grammatical and syntactical corrections, tailored to formal English usage.
*   **Seamless Google Docs Integration:** Enjoy a user-friendly sidebar within Google Docs for easy access to all features.
*   **Context-Aware Suggestions:** The add-on uses the Gemini 1.5 Flash API to provide context-aware paraphrasing and translation.
*   **Customizable Output**: Change the color of the output text and customize the prompt.

## Usage

1.  **Installation:** Install the Capitals add-on from the Google Workspace Marketplace.
2.  **Open the Add-on:** In your Google Doc, go to "Extensions" > "Capitals" > "Open paraphrase editor."
3.  **Select Text:** Highlight the text you want to paraphrase or translate.
4.  **Choose Action:** Click either the "Paraphrase" or "Translate" button in the sidebar.
5.  **View Results:** The processed text will be inserted directly into your document in green color.

## Technical Details

The add-on is built using Google Apps Script and integrates with the Gemini 1.5 Flash API. Here are the main components:

### Main Functions:

*   **`onOpen()`:** Adds a custom menu to Google Docs when the document is opened.
*   **`showEditor()`:** Displays the sidebar with the add-on's options.
*   **`runParaphrase(type)`:**
    *   Manages the paraphrasing/translation process.
    *   Retrieves the selected text.
    *   Calls `getParaphrasedText` to process the text.
    *   Calls `insertParaphrasedText` to insert the result.
*   **`extractSelectedText(selection)`:** Extracts the selected text while preserving formatting.
*   **`getParaphrasedText(text, type)`:**
    *   Sends the text to the Gemini API for processing (paraphrasing or translating).
    *   Constructs the prompt based on the selected `type`.
    *   Handles the API request and response.
*   **`insertParaphrasedText(doc, selection, text)`:**
    *   Inserts the processed text into the document with green color.
    *   Finds the correct insertion point after the selected text.
    *   Adds a new paragraph with the corrected text.

### API Usage

*   **Gemini 1.5 Flash:** The add-on uses the Gemini API for natural language processing.
*   **API Key:** Replace `"YOUR_API_KEY_HERE"` in `getParaphrasedText` with your actual API key.

## Customization

* **API key and Prompts:** You can customize the behaviour of the add on by changing the API Key and the prompts in the `getParaphrasedText` function, in the `Capitals_code.js` file.
* **Color**: You can customize the color of the output text in the `insertParaphrasedText` function, in the `Capitals_code.js` file.

## Dependencies

*   **Gemini 1.5 Flash API:** Required for AI-powered text processing.
*   **Google Apps Script:** The add-on is built using Google Apps Script.

## Author

juankeyboard@gmail.com
