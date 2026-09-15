// Delegation also handles BLOGROLL inserted by Swup navigation.
document.addEventListener("click", async (event) => {
  const button = event.target.closest(".blogroll-copy-button");
  if (!button || button.disabled) return;
  const row = button.closest(".blogroll-copy-row");
  const status = row.querySelector(".blogroll-copy-status");
  const text = row.querySelector("pre code").textContent;
  button.disabled = true;
  status.textContent = "";
  try {
    let copied = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (_) {
        // Try the selection-based fallback if clipboard permission is denied.
      }
    }
    if (!copied) {
      const input = document.createElement("textarea");
      input.value = text;
      input.setAttribute("readonly", "");
      input.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
      document.body.appendChild(input);
      try {
        input.select();
        copied = document.execCommand("copy");
      } finally {
        input.remove();
        button.focus({ preventScroll: true });
      }
    }
    status.textContent = copied ? "Copied!" : "Copy failed. Please select and copy the information above.";
  } catch (_) {
    status.textContent = "Copy failed. Please select and copy the information above.";
  } finally {
    button.disabled = false;
  }
});
