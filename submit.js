import { submissionPortalConfig } from "./data/site-data.js";

const form = document.querySelector("#submission-form");
const submitButton = document.querySelector("#submit-button");
const statusBox = document.querySelector("#submission-status");
const configNote = document.querySelector("#submission-config-note");
const turnstileShell = document.querySelector("#turnstile-shell");
const turnstileWidget = document.querySelector("#turnstile-widget");
const nextStepPanel = document.querySelector("#submission-next-step");
const statusLinkAnchor = document.querySelector("#status-link-anchor");
const copyStatusLinkButton = document.querySelector("#copy-status-link");

const RECENT_JOBS_KEY = "didCaseExplorerRecentJobs";
let turnstileWidgetId = null;
let redirectTimerId = null;

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
  statusBox.hidden = !message;
}

function buildStatusUrl(jobId, accessToken) {
  const url = new URL("./status.html", window.location.href);
  url.searchParams.set("job", jobId);
  url.hash = `token=${encodeURIComponent(accessToken)}`;
  return url.toString();
}

function readRecentJobs() {
  try {
    const raw = window.localStorage.getItem(RECENT_JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Failed to read recent jobs from localStorage.", error);
    return [];
  }
}

function saveRecentJob(entry) {
  const jobs = readRecentJobs().filter((job) => job.jobId !== entry.jobId);
  jobs.unshift(entry);
  window.localStorage.setItem(RECENT_JOBS_KEY, JSON.stringify(jobs.slice(0, 8)));
}

function showNextStepPanel(statusUrl) {
  nextStepPanel.hidden = false;
  statusLinkAnchor.href = statusUrl;
  if (redirectTimerId) {
    window.clearTimeout(redirectTimerId);
  }
  redirectTimerId = window.setTimeout(() => {
    window.location.assign(statusUrl);
  }, 1400);
}

function hideNextStepPanel() {
  nextStepPanel.hidden = true;
  statusLinkAnchor.href = "./status.html";
  if (redirectTimerId) {
    window.clearTimeout(redirectTimerId);
    redirectTimerId = null;
  }
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
    "This form posts to a restricted OCR backend. After upload, a private status page will track OCR progress and artifact availability.";
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

async function copyStatusLink() {
  const href = statusLinkAnchor.href;
  if (!href || href.endsWith("/status.html")) {
    return;
  }
  try {
    await navigator.clipboard.writeText(href);
    copyStatusLinkButton.textContent = "Copied";
    window.setTimeout(() => {
      copyStatusLinkButton.textContent = "Copy private link";
    }, 1800);
  } catch (error) {
    console.error(error);
    setStatus("Could not copy the private status link. You can still open it directly.", "warning");
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
  hideNextStepPanel();
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
    if (!payload.jobId || !payload.accessToken) {
      throw new Error("Submission succeeded but the backend did not return a private status token.");
    }

    const statusUrl = buildStatusUrl(payload.jobId, payload.accessToken);
    saveRecentJob({
      jobId: payload.jobId,
      accessToken: payload.accessToken,
      statusUrl,
      createdAt: new Date().toISOString(),
      originalFilename: formData.get("file")?.name || "",
    });

    form.reset();
    if (siteKey && window.turnstile && turnstileWidgetId !== null) {
      window.turnstile.reset(turnstileWidgetId);
    }
    setStatus(
      `Submission queued successfully. Redirecting to the private status page for job ${payload.jobId}…`,
      "success",
    );
    showNextStepPanel(statusUrl);
  } catch (error) {
    console.error(error);
    hideNextStepPanel();
    setStatus(error.message || "Submission failed.", "error");
  } finally {
    submitButton.disabled = false;
  }
}

renderConfigBanner();
initTurnstile();
copyStatusLinkButton?.addEventListener("click", copyStatusLink);
form.addEventListener("submit", submitForm);
