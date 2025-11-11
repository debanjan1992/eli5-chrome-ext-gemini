import { GoogleGenAI } from "@google/genai";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "eli5",
    title: "Explain Like I'm 5",
    contexts: ["selection"],
  });

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (tab?.id && info.menuItemId === "eli5" && info.selectionText) {
      chrome.tabs.sendMessage(tab.id, {
        type: "SHOW_ELI5_TEXT",
        text: "Generating explanation...",
        loading: true,
      });
      const explanation = await getExplanation(info.selectionText);
      chrome.tabs.sendMessage(tab.id, {
        type: "SHOW_ELI5_TEXT",
        text: explanation,
        loading: false,
      });
    }
  });
  chrome.storage.sync.get("geminiApiKey", (result) => {
    if (!result.geminiApiKey) {
      chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Check if the message is the one we want
    if (request.action === "openOptionsPage") {
      // Open the options page
      chrome.runtime.openOptionsPage();
    }
  });
});

function buildPrompt(selectionText: string): string {
  return `Explain the following like I'm 5 years old: ${selectionText}`;
}

async function getExplanation(selectionText: string): Promise<string> {
  try {
    const apiKey = (await chrome.storage.sync.get("geminiApiKey")).geminiApiKey;
    const prompt = buildPrompt(selectionText);
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    return response.text || "";
  } catch (err: any) {
    console.error("Failed to get explanation from Gemini API", err);
    return (
      "Sorry, I couldn't generate an explanation at this time." + err.message
    );
  }
}
