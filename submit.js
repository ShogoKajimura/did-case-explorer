import { submissionPortalConfig } from "./data/site-data.js";

const form = document.querySelector("#submission-form");
const submitButton = document.querySelector("#submit-button");
const statusBox = document.querySelector("#submission-status");
const configNote = document.querySelector("#submission-config-note");
const turnstileShell = document.querySelector("#turnstile-shell");
const turnstileWidget = document.querySelector("#turnstile-widget");

let turnstileWidgetId = null;

function configuredIntakeUrl() {
  const url = submissionPortalConfig.intakeUrl?.trim() || "";
  if (!url || url.includes("YOUR-") || url.includes("example")) {
    return "";
  }
  return url;
}

function configuredTurnstileSiteKey() {
  const key = submissionPortalConfig.turnstileSiteKey?.trim() || "";
  if (!key || key.includes("YOUR-") || key.includes("example")) {
    return "";
  }
  return key;
}

function setStatus(message, tone = "neutral") {
  statusBox.textContent = message;
  statusBox.dataset.tone = tone;
}

function renderConfigBanner() {
  const intakeUrl = configuredIntakeUrl();
  if (!intakeUrl) {
    configNote.dataset.tone = "warning";
    configNote.textContent =
      "Submission backend is not configured yet. Set submissionPortalConfig.intakeUrl before accepting public uploads.";
    submitButton.disabled = true;
    return;
  }

  configNote.dataset.tone = "neutral";
  configNote.textContent =
    "This form posts to a restricted OCR backend. Submitted PDFs are not published on the public explorer by default.";
}

function loadTurnstile() {
  return new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve(window.turnstile);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => reject(new Error("Failed to load Turnstile script."));
    document.head.append(script);
  });
}

async function initTurnstile() {
  const siteKey = configuredTurnstileSiteKey();
  if (!siteKey) {
    turnstileShell.hidden = true;
    return;
  }

  try {
    const turnstile = await loadTurnstile();
    turnstileShell.hidden = false;
    turnstileWidgetId = turnstile.render(turnstileWidget, {
      sitekey: siteKey,
      theme: "light",
    });
  } catch (error) {
    console.error(error);
    turnstileShell.hidden = false;
    turnstileWidget.innerHTML =
      "<p class='turnstile-fallback'>Turnstile could not be loaded. Check the site key or browser network settings.</p>";
  }
}

async function submitForm(event) {
  event.preventDefault();
  const intakeUrl = configuredIntakeUrl();
  if (!intakeUrl) {
    setStatus("Submission backend is not configured yet.", "warning");
    return;
  }

  if (!form.reportValidity()) {
    setStatus("Please complete the required fields before submitting.", "warning");
    return;
  }

  const formData = new FormData(form);
  const siteKey = configuredTurnstileSiteKey();
  if (siteKey) {
    const token = window.turnstile?.getResponse(turnstileWidgetId);
    if (!token) {
      setStatus("Please complete the human-verification step.", "warning");
      return;
    }
    formData.append("turnstile_token", token);
  }

  submitButton.disabled = true;
  setStatus("Uploading PDF to the restricted OCR backend…", "neutral");

  try {
    const response = await fetch(intakeUrl, {
      method: "POST",
      body: formData,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.detail || `Submission failed with status ${response.status}.`);
    }

    form.reset();
    if (siteKey && window.turnstile && turnstileWidgetId !== null) {
      window.turnstile.reset(turnstileWidgetId);
    }
    setStatus(
      `Submission queued successfully. Job ID: ${payload.jobId}. Keep this ID if you need to reference the upload later.`,
      "success",
    );
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Submission failed.", "error");
  } finally {
    submitButton.disabled = false;
  }
}

renderConfigBanner();
initTurnstile();
form.addEventListener("submit", submitForm);
