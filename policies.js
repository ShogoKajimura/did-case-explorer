import { submissionPortalConfig } from "./data/site-data.js";

const form = document.querySelector("#contact-form");
const statusBox = document.querySelector("#contact-status");
const submitButton = document.querySelector("#contact-submit");

function configuredIntakeUrl() {
  const url = submissionPortalConfig.intakeUrl?.trim() || "";
  if (!url || url.includes("YOUR-") || url.includes("example")) {
    return "";
  }
  return url;
}

function apiBaseUrl() {
  return configuredIntakeUrl().replace(/\/api\/v1\/public\/submissions\/?$/, "");
}

function setStatus(message, tone = "neutral") {
  statusBox.hidden = false;
  statusBox.textContent = message;
  statusBox.dataset.tone = tone;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const base = apiBaseUrl();
  if (!base) {
    setStatus("The contact backend is not configured yet.", "warning");
    return;
  }
  if (!form.elements.message.value.trim()) {
    setStatus("Please enter a message.", "warning");
    return;
  }
  submitButton.disabled = true;
  setStatus("Sending your request…", "neutral");
  try {
    const response = await fetch(`${base}/api/v1/public/contact`, {
      method: "POST",
      body: new FormData(form),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.detail || `Request failed with status ${response.status}.`);
    }
    setStatus(payload.message || "Your request has been received and will be reviewed.", "success");
    form.reset();
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Could not send your request. Please try again later.", "error");
  } finally {
    submitButton.disabled = false;
  }
});
