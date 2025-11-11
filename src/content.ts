import { showExplanationBox } from "./utils/ui";

chrome.runtime.onMessage.addListener((message,) => {
  if (message.type === "SHOW_ELI5_TEXT") {
    showExplanationBox(message.text, message.loading,);
  }
});

