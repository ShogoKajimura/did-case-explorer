import { submissionPortalConfig } from "./data/site-data.js";

const RECENT_JOBS_KEY = "didCaseExplorerRecentJobs";
const POLL_INTERVAL_MS = 4000;

const configNote = document.querySelector("#status-config-note");
const form = document.querySelector("#status-form");
const jobInput = document.querySelector("#status-job-id");
const tokenInput = document.querySelector("#status-access-token");
const messageBox = document.querySelector("#status-message");
const resultSection = document.querySelector("#status-result");
const headline = document.querySelector("#status-headline");
const pill = document.querySelector("#status-pill");
const originalFilename = document.querySelector("#status-original-filename");
const createdAt = document.querySelector("#status-created-at");
const updatedAt = document.querySelector("#status-updated-at");
const workerState = document.querySelector("#status-state");
const detailBox = document.querySelector("#status-detail");
const downloadSearchablePdfButton = document.querySelector("#download-searchable-pdf");
const downloadCanonicalTextButton = document.querySelector("#download-canonical-text");
const copyLinkButton = document.querySelector("#status-copy-link");
const recentJobsShell = document.querySelector("#recent-jobs");
const metadataPanel = document.querySelector("#metadata-panel");
const metadataForm = document.querySelector("#metadata-form");
const saveMetadataButton = document.querySelector("#save-metadata-button");
const downloadPanel = document.querySelector("#download-panel");
const downloadNote = document.querySelector("#download-note");

let pollTimerId = null;
let currentJob = null;

function configuredIntakeUrl() {
  const url = submissionPortalConfig.intakeUrl?.trim() || "";
  if (!url || url.includes("YOUR-") || url.includes("example")) {
    return "";
  }
  return url;
}

function apiBaseUrl() {
  const intakeUrl = configuredIntakeUrl();
  return intakeUrl.replace(/\/api\/v1\/public\/submissions\/?$/, "");
}

function buildStatusUrl(jobId, accessToken) {
  const url = new URL("./status.html", window.location.href);
  url.searchParams.set("job", jobId);
  url.hash = `token=${encodeURIComponent(accessToken)}`;
  return url.toString();
}

function setMessage(message, tone = "neutral") {
  messageBox.textContent = message;
  messageBox.dataset.tone = tone;
}

function stopPolling() {
  if (pollTimerId) {
    window.clearTimeout(pollTimerId);
    pollTimerId = null;
  }
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

function writeRecentJobs(entries) {
  window.localStorage.setItem(RECENT_JOBS_KEY, JSON.stringify(entries.slice(0, 8)));
}

function rememberCurrentJob() {
  if (!currentJob?.jobId || !currentJob?.accessToken) {
    return;
  }
  const entries = readRecentJobs().filter((job) => job.jobId !== currentJob.jobId);
  entries.unshift({
    jobId: currentJob.jobId,
    accessToken: currentJob.accessToken,
    statusUrl: buildStatusUrl(currentJob.jobId, currentJob.accessToken),
    createdAt: currentJob.createdAt || new Date().toISOString(),
    originalFilename: currentJob.originalFilename || "",
    status: currentJob.status || "",
  });
  writeRecentJobs(entries);
  renderRecentJobs();
}

function formatTimestamp(value) {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function currentStatusUrl() {
  if (!currentJob?.jobId || !currentJob?.accessToken) {
    return "";
  }
  return buildStatusUrl(currentJob.jobId, currentJob.accessToken);
}

function syncBrowserUrl() {
  const url = currentStatusUrl();
  if (!url) {
    return;
  }
  window.history.replaceState({}, "", url);
}

function fillFormFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const jobId = params.get("job") || "";
  const accessToken = hashParams.get("token") || "";
  if (jobId) {
    jobInput.value = jobId;
  }
  if (accessToken) {
    tokenInput.value = accessToken;
  }
}

function renderRecentJobs() {
  const jobs = readRecentJobs();
  if (!jobs.length) {
    recentJobsShell.innerHTML = "<p class='section-note'>No recent jobs are stored on this browser yet.</p>";
    return;
  }
  recentJobsShell.innerHTML = "";
  const list = document.createElement("div");
  list.className = "recent-job-list";

  jobs.forEach((job) => {
    const item = document.createElement("article");
    item.className = "recent-job-item";

    const title = document.createElement("strong");
    title.textContent = job.originalFilename || job.jobId;

    const meta = document.createElement("p");
    meta.className = "recent-job-meta";
    meta.textContent = `${job.jobId} · ${job.status || "saved"} · ${formatTimestamp(job.createdAt)}`;

    const action = document.createElement("button");
    action.type = "button";
    action.className = "button button-secondary";
    action.textContent = "Open status";
    action.addEventListener("click", () => {
      jobInput.value = job.jobId;
      tokenInput.value = job.accessToken;
      loadStatus();
    });

    item.append(title, meta, action);
    list.append(item);
  });

  recentJobsShell.append(list);
}

function renderResult(payload) {
  resultSection.hidden = false;
  metadataPanel.hidden = false;
  downloadPanel.hidden = false;
  headline.textContent = payload.message;
  pill.textContent = payload.status;
  pill.dataset.state = payload.status;
  originalFilename.textContent = payload.originalFilename || "-";
  createdAt.textContent = formatTimestamp(payload.createdAt);
  updatedAt.textContent = formatTimestamp(payload.updatedAt);
  workerState.textContent = payload.status;
  detailBox.textContent = payload.error || payload.screeningMessage || payload.message;
  detailBox.dataset.tone = payload.status === "failed" ? "error" : payload.screeningStatus === "needs_information" ? "warning" : "neutral";

  downloadSearchablePdfButton.disabled = !payload.searchablePdfReady || !payload.downloadsAllowed;
  downloadCanonicalTextButton.disabled = !payload.canonicalTextReady || !payload.downloadsAllowed;
  downloadNote.textContent = payload.downloadsAllowed
    ? "Artifacts are available when the buttons below are enabled."
    : payload.screeningMessage || "Downloads are temporarily held on the restricted backend.";
  downloadNote.dataset.tone = payload.downloadsAllowed ? "neutral" : "warning";
}

function metadataEndpoint(jobId) {
  return `${apiBaseUrl()}/api/v1/public/jobs/${encodeURIComponent(jobId)}/metadata`;
}

async function loadMetadata(jobId, accessToken) {
  const response = await fetch(metadataEndpoint(jobId), {
    headers: {
      "X-Job-Access-Token": accessToken,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || `Metadata lookup failed with status ${response.status}.`);
  }
  return payload;
}

function fillMetadataForm(payload) {
  metadataForm.elements.submitter_name.value = payload.submitterName || "";
  metadataForm.elements.submitter_email.value = payload.submitterEmail || "";
  metadataForm.elements.submitter_affiliation.value = payload.submitterAffiliation || "";
  metadataForm.elements.contributor_display_name.value = payload.contributorDisplayName || "";
  metadataForm.elements.contributor_link_url.value = payload.contributorLinkUrl || "";
  metadataForm.elements.paper_title.value = payload.paperTitle || "";
  metadataForm.elements.paper_authors.value = payload.paperAuthors || "";
  metadataForm.elements.paper_year.value = payload.paperYear || "";
  metadataForm.elements.paper_journal.value = payload.paperJournal || "";
  metadataForm.elements.source_url.value = payload.sourceUrl || "";
  metadataForm.elements.notes.value = payload.notes || "";
}

async function saveMetadata(options = {}) {
  const { quiet = false } = options;
  if (!currentJob?.jobId || !currentJob?.accessToken) {
    return false;
  }
  const formData = new FormData(metadataForm);
  const response = await fetch(metadataEndpoint(currentJob.jobId), {
    method: "POST",
    headers: {
      "X-Job-Access-Token": currentJob.accessToken,
    },
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || `Metadata save failed with status ${response.status}.`);
  }
  fillMetadataForm(payload);
  const refreshedStatus = await fetchStatus(currentJob.jobId, currentJob.accessToken);
  currentJob.status = refreshedStatus.status;
  renderResult(refreshedStatus);
  if (!quiet) {
    setMessage("Optional details were saved to the restricted job record.", "success");
  }
  return true;
}

async function fetchStatus(jobId, accessToken) {
  const response = await fetch(`${apiBaseUrl()}/api/v1/public/jobs/${encodeURIComponent(jobId)}`, {
    headers: {
      "X-Job-Access-Token": accessToken,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || `Status lookup failed with status ${response.status}.`);
  }
  return payload;
}

async function loadStatus() {
  stopPolling();
  const jobId = jobInput.value.trim();
  const accessToken = tokenInput.value.trim();
  if (!jobId || !accessToken) {
    setMessage("Enter both the job ID and access token.", "warning");
    resultSection.hidden = true;
    return;
  }

  try {
    setMessage("Loading private OCR status…", "neutral");
    const payload = await fetchStatus(jobId, accessToken);
    currentJob = {
      jobId,
      accessToken,
      createdAt: payload.createdAt,
      originalFilename: payload.originalFilename,
      status: payload.status,
    };
    syncBrowserUrl();
    rememberCurrentJob();
    renderResult(payload);
    try {
      const metadata = await loadMetadata(jobId, accessToken);
      fillMetadataForm(metadata);
    } catch (metadataError) {
      console.error(metadataError);
    }

    const tone = payload.status === "failed" ? "error" : payload.status === "completed" ? "success" : "neutral";
    setMessage(payload.message, tone);

    if (payload.status === "pending" || payload.status === "processing") {
      pollTimerId = window.setTimeout(loadStatus, POLL_INTERVAL_MS);
    }
  } catch (error) {
    console.error(error);
    setMessage(error.message || "Status lookup failed.", "error");
    resultSection.hidden = true;
    metadataPanel.hidden = true;
    downloadPanel.hidden = true;
  }
}

async function downloadArtifact(artifact) {
  if (!currentJob?.jobId || !currentJob?.accessToken) {
    setMessage("Load a valid private job before downloading artifacts.", "warning");
    return;
  }
  try {
    await saveMetadata({ quiet: true });
  } catch (metadataError) {
    console.error(metadataError);
    setMessage(metadataError.message || "Could not save optional details before download.", "warning");
  }
  const response = await fetch(
    `${apiBaseUrl()}/api/v1/public/jobs/${encodeURIComponent(currentJob.jobId)}/download/${artifact}`,
    {
      headers: {
        "X-Job-Access-Token": currentJob.accessToken,
      },
    },
  );
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail || `Download failed with status ${response.status}.`);
  }

  const blob = await response.blob();
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;

  const disposition = response.headers.get("Content-Disposition") || "";
  const filenameMatch = disposition.match(/filename=\"?([^"]+)\"?/i);
  anchor.download = filenameMatch?.[1] || (artifact === "searchable-pdf" ? "searchable.pdf" : "canonical.txt");
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

async function copyCurrentLink() {
  const url = currentStatusUrl();
  if (!url) {
    setMessage("Load a job first, then copy the private status link.", "warning");
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    copyLinkButton.textContent = "Copied";
    window.setTimeout(() => {
      copyLinkButton.textContent = "Copy this private link";
    }, 1800);
  } catch (error) {
    console.error(error);
    setMessage("Could not copy the private status link.", "error");
  }
}

function renderConfigNote() {
  if (!configuredIntakeUrl()) {
    configNote.dataset.tone = "warning";
    configNote.textContent =
      "Status lookup is unavailable until submissionPortalConfig.intakeUrl points to the restricted backend.";
    return;
  }
  configNote.dataset.tone = "neutral";
  configNote.textContent =
    "This page uses the private token from your submission link to query the restricted OCR backend.";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadStatus();
});

downloadSearchablePdfButton.addEventListener("click", async () => {
  try {
    await downloadArtifact("searchable-pdf");
  } catch (error) {
    console.error(error);
    setMessage(error.message || "Could not download the searchable PDF.", "error");
  }
});

downloadCanonicalTextButton.addEventListener("click", async () => {
  try {
    await downloadArtifact("canonical-text");
  } catch (error) {
    console.error(error);
    setMessage(error.message || "Could not download the canonical text.", "error");
  }
});

copyLinkButton.addEventListener("click", copyCurrentLink);
metadataForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await saveMetadata();
  } catch (error) {
    console.error(error);
    setMessage(error.message || "Could not save optional details.", "error");
  }
});

renderConfigNote();
renderRecentJobs();
fillFormFromLocation();
if (jobInput.value.trim() && tokenInput.value.trim()) {
  loadStatus();
}
