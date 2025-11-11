function getUserInputApiKeyEl(): HTMLInputElement {
  return document.getElementById("apiKey") as HTMLInputElement;
}

function getStatusEl() {
  return document.getElementById("status-message")!;
}

function getSaveButton(): HTMLButtonElement {
  return document.getElementById("save-btn")! as HTMLButtonElement;
}

function printMessage(message: string, success: boolean) {
  const status = getStatusEl();
  status.textContent = message;
  status.style.display = "block";
  if (success) {
    status.classList.remove("error");
    status.classList.add("success");
  } else {
    status.classList.remove("success");
    status.classList.add("error");
  }
}

function saveOptions() {
  const apiKey = getUserInputApiKeyEl().value;

  if (!apiKey || apiKey.length === 0) {
    printMessage("API Key cannot be empty!", false);
    return;
  }

  chrome.storage.sync.set(
    {
      geminiApiKey: apiKey,
    },
    () => {
      printMessage("API Key saved successfully!", true);
      setTimeout(() => {
        printMessage;
        window.close();
      }, 1500);
    }
  );
}

// Function to load the saved API key
function restoreOptions() {
  chrome.storage.sync.get("geminiApiKey", (data) => {
    getUserInputApiKeyEl().value = data.geminiApiKey || "";
  });
}

// Add event listeners
document.addEventListener("DOMContentLoaded", restoreOptions);
getSaveButton().addEventListener("click", saveOptions);

getUserInputApiKeyEl().addEventListener("input", (e) => {
  const value = (e.target as HTMLInputElement).value;

  if (!value || value.length === 0) {
    getSaveButton().disabled = true;
  } else {
    getSaveButton().disabled = false;
  }
});
