import { marked } from "marked";

function appendMaterialIconsStyles() {
  if (
    !document.querySelector(
      'link[href="https://fonts.googleapis.com/icon?family=Material+Icons"]'
    )
  ) {
    const fontLink = document.createElement("link");
    fontLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);
  }
}

export async function showExplanationBox(
  message: string,
  loading: boolean = false
) {
  appendMaterialIconsStyles();
  const oldBox = document.getElementById("eli5-explanation-box");
  if (oldBox) {
    oldBox.remove();
  }
  const box = document.createElement("div");
  box.id = "eli5-explanation-box";
  box.innerHTML = `
      <div class="eli5-header">
        <h3>Explain like I'm 5</h3>
        <div class="actions">
            <i class="material-icons" id="copy-btn" title="Copy Explanation">content_copy</i>
            <i class="material-icons" id="configure-btn" title="Configure API key">settings</i>
            <button id="eli5-close-btn" title="Close">&times;</button>
        </div>
      </div>
      <div class="eli5-content">
        ${
          loading
            ? '<div class="spinner"></div><div class="loading-message" style="text-align:center;"></div>'
            : "<p></p>"
        }
      </div>
      <div class="eli5-resize-handle left"></div>
      <div class="eli5-resize-handle right"></div>
    `;

  if (!loading) {
    const contentElement = box.querySelector(".eli5-content p")!;
    contentElement.innerHTML = await marked.parse(message);
  } else {
    const contentElement = box.querySelector(".eli5-content .loading-message")!;
    contentElement.innerHTML = await marked.parse(message);
  }

  box.querySelector("#eli5-close-btn")!.addEventListener("click", () => {
    box.remove();
  });
  box.querySelector("#copy-btn")!.addEventListener("click", () => {
    navigator.clipboard.writeText(message);
  });
  box.querySelector("#configure-btn")!.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "openOptionsPage" });
  });
  document.body.appendChild(box);
  const header = box.querySelector<HTMLElement>(".eli5-header")!;
  makeDraggable(box, header);
  const leftHandle = box.querySelector<HTMLElement>(
    ".eli5-resize-handle.left"
  )!;
  const rightHandle = box.querySelector<HTMLElement>(
    ".eli5-resize-handle.right"
  )!;
  makeResizable(box, leftHandle, rightHandle);
}

function makeResizable(
  box: HTMLElement,
  leftHandle: HTMLElement,
  rightHandle: HTMLElement
) {
  let isResizing = false;
  let currentHandle: "left" | "right" | null = null;
  let initialX: number;
  let initialWidth: number;
  let initialLeft: number;

  const MIN_WIDTH = 250;
  const MAX_WIDTH = 800;

  // Function to start resizing
  const onMouseDown = (e: MouseEvent, handle: "left" | "right") => {
    isResizing = true;
    currentHandle = handle;
    initialX = e.clientX;
    initialWidth = box.offsetWidth;
    initialLeft = box.offsetLeft; // Get the box's current 'left' position

    e.preventDefault();
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // Attach mousedown listeners
  leftHandle.addEventListener("mousedown", (e) => onMouseDown(e, "left"));
  rightHandle.addEventListener("mousedown", (e) => onMouseDown(e, "right"));

  function onMouseMove(e: MouseEvent) {
    if (!isResizing || !currentHandle) return;

    // Calculate mouse movement
    const dx = e.clientX - initialX;

    if (currentHandle === "right") {
      // --- Right Handle Logic (Simple) ---
      let newWidth = initialWidth + dx;

      // Apply constraints
      if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
      if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;

      box.style.width = `${newWidth}px`;
    } else if (currentHandle === "left") {
      // --- Left Handle Logic (Complex) ---
      let newWidth = initialWidth - dx;
      let newLeft = initialLeft + dx;

      // Apply constraints (check width first)
      if (newWidth < MIN_WIDTH) {
        newWidth = MIN_WIDTH;
        // Recalculate dx and newLeft based on the clamped width
        const constrainedDx = initialWidth - MIN_WIDTH;
        newLeft = initialLeft + constrainedDx;
      } else if (newWidth > MAX_WIDTH) {
        newWidth = MAX_WIDTH;
        // Recalculate dx and newLeft
        const constrainedDx = initialWidth - MAX_WIDTH;
        newLeft = initialLeft + constrainedDx;
      }

      box.style.width = `${newWidth}px`;
      box.style.left = `${newLeft}px`;
    }
  }

  function onMouseUp() {
    isResizing = false;
    currentHandle = null;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
}

function makeDraggable(box: HTMLElement, header: HTMLElement) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  // On mousedown on the header
  header.addEventListener("mousedown", (e: MouseEvent) => {
    isDragging = true;

    // Calculate the offset of the mouse from the box's top-left corner
    // This prevents the box from "jumping" to the cursor position
    offsetX = e.clientX - box.getBoundingClientRect().left;
    offsetY = e.clientY - box.getBoundingClientRect().top;

    // Set position to fixed and grab current coordinates
    // This "unlocks" it from the 'right: 20px' style rule
    box.style.position = "fixed";
    box.style.left = `${box.getBoundingClientRect().left}px`;
    box.style.top = `${box.getBoundingClientRect().top}px`;
    box.style.right = "auto"; // Disable the 'right' rule
    box.style.bottom = "auto"; // Disable any 'bottom' rule

    // Prevent text selection while dragging
    e.preventDefault();

    // Add the move and up listeners to the *whole document*
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  // While the mouse is moving
  function onMouseMove(e: MouseEvent) {
    if (!isDragging) return;

    // Calculate new position
    let newX = e.clientX - offsetX;
    let newY = e.clientY - offsetY;

    // Set the box's new position
    box.style.left = `${newX}px`;
    box.style.top = `${newY}px`;
  }

  // When the mouse is released
  function onMouseUp() {
    isDragging = false;

    // Clean up: remove listeners from the document
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
}
