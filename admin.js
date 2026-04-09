import { submissionPortalConfig } from "./data/site-data.js";

const ADMIN_TOKEN_KEY = "didCaseExplorerAdminToken";

const loginForm = document.querySelector("#admin-login-form");
const tokenInput = document.querySelector("#admin-token");
const logoutButton = document.querySelector("#admin-logout");
const refreshButton = document.querySelector("#admin-refresh");
const exportButton = document.querySelector("#admin-export");
const sourceFilter = document.querySelector("#admin-source-filter");
const reviewFilter = document.querySelector("#admin-review-filter");
const searchInput = document.querySelector("#admin-search");
const configNote = document.querySelector("#admin-config-note");
const sessionStatus = document.querySelector("#admin-session-status");
const headline = document.querySelector("#admin-results-headline");
const countPill = document.querySelector("#admin-count-pill");
const tableBody = document.querySelector("#admin-table-body");
const detailPanel = document.querySelector("#admin-detail-panel");
const detailTitle = document.querySelector("#admin-detail-title");
const detailPill = document.querySelector("#admin-detail-pill");
const detailGrid = document.querySelector("#admin-detail-grid");
const reviewForm = document.querySelector("#admin-review-form");
const detailStatus = document.querySelector("#admin-detail-status");
const deleteButton = document.querySelector("#admin-delete-job");

let adminJobs = [];
let selectedJobId = "";

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

function getAdminToken() {
  return window.sessionStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

function setAdminToken(token) {
  if (token) {
    window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

function setMessage(element, message, tone = "neutral") {
  element.textContent = message;
  element.dataset.tone = tone;
}

function adminHeaders() {
  return {
    "X-Admin-Token": getAdminToken(),
  };
}

async function fetchAdminJson(path, options = {}) {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...adminHeaders(),
    },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail || `Admin request failed with status ${response.status}.`);
  }
  return response.json();
}

function clearDetail() {
  selectedJobId = "";
  detailPanel.hidden = true;
  detailGrid.innerHTML = "";
}

function formatTimestamp(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function currentJobs() {
  const needle = searchInput.value.trim().toLowerCase();
  return adminJobs.filter((job) => {
    if (sourceFilter.value !== "all") {
      if (sourceFilter.value === "public" && job.sourceChannel !== "public_submission_form") return false;
      if (sourceFilter.value === "private" && job.sourceChannel !== "private_api") return false;
    }
    if (reviewFilter.value !== "all" && job.adminReviewState !== reviewFilter.value) {
      return false;
    }
    if (!needle) return true;
    const haystacks = [
      job.jobId,
      job.originalFilename,
      job.paperTitle || "",
      job.paperAuthors || "",
      job.paperJournal || "",
      job.sourceUrl || "",
      job.notes || "",
      job.submitterEmail || "",
    ];
    return haystacks.some((value) => value.toLowerCase().includes(needle));
  });
}

function renderTable() {
  const jobs = currentJobs();
  countPill.textContent = `${jobs.length} jobs`;
  headline.textContent = jobs.length ? "Restricted submissions and OCR jobs" : "No jobs match the current filter.";
  if (!jobs.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5"><div class="admin-empty">No jobs match the current filter state.</div></td>
      </tr>
    `;
    clearDetail();
    return;
  }

  tableBody.innerHTML = jobs
    .map(
      (job) => `
        <tr class="${job.jobId === selectedJobId ? "admin-row-active" : ""}">
          <td>
            <button class="admin-row-button" type="button" data-job-id="${escapeHtml(job.jobId)}">
              <strong>${escapeHtml(job.originalFilename)}</strong><br />
              <span class="recent-job-meta">${escapeHtml(job.jobId)} · ${escapeHtml(formatTimestamp(job.createdAt))}</span>
            </button>
          </td>
          <td>${escapeHtml(job.status)}</td>
          <td>${escapeHtml(job.screeningStatus)}</td>
          <td>${escapeHtml(job.adminReviewState)}</td>
          <td>${job.includeInPublicUpdate ? "candidate" : "not queued"}</td>
        </tr>
      `,
    )
    .join("");

  tableBody.querySelectorAll("[data-job-id]").forEach((button) => {
    button.addEventListener("click", () => selectJob(button.dataset.jobId));
  });
}

function detailCard(label, value) {
  return `
    <div class="admin-detail-card">
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value || "-")}</dd>
    </div>
  `;
}

function fillReviewForm(job) {
  reviewForm.elements.admin_review_state.value = job.adminReviewState;
  reviewForm.elements.include_in_public_update.checked = job.includeInPublicUpdate;
  reviewForm.elements.public_release_cohort.value = job.publicReleaseCohort || "";
  reviewForm.elements.contributor_display_approved.checked = job.contributorDisplayApproved;
  reviewForm.elements.admin_notes.value = job.adminNotes || "";
}

function selectJob(jobId) {
  const job = adminJobs.find((entry) => entry.jobId === jobId);
  if (!job) return;
  selectedJobId = jobId;
  detailPanel.hidden = false;
  detailTitle.textContent = job.paperTitle || job.originalFilename;
  detailPill.textContent = job.status;
  detailPill.dataset.state = job.status;
  detailGrid.innerHTML = [
    detailCard("Job ID", job.jobId),
    detailCard("Created", formatTimestamp(job.createdAt)),
    detailCard("Updated", formatTimestamp(job.updatedAt)),
    detailCard("Screening", job.screeningStatus),
    detailCard("OCR languages", job.ocrLanguagesUsed || job.languages),
    detailCard("Downloads", job.downloadsAllowed ? "allowed" : "held"),
    detailCard("Authors", job.paperAuthors || "-"),
    detailCard("Journal", job.paperJournal || "-"),
    detailCard("Year", job.paperYear || "-"),
    detailCard("Source URL", job.sourceUrl || "-"),
    detailCard("Submitter email", job.submitterEmail || "-"),
    detailCard("Contributor requested", job.contributorDisplayRequested ? "yes" : "no"),
  ].join("");
  fillReviewForm(job);
  setMessage(
    detailStatus,
    job.screeningReason || "Use the form below to decide whether this job should be carried into a later public update.",
    job.screeningStatus === "needs_information" ? "warning" : "neutral",
  );
  renderTable();
}

async function refreshAdminJobs() {
  const token = getAdminToken();
  if (!token) {
    setMessage(sessionStatus, "Enter the admin token to load the restricted review queue.", "warning");
    renderTable();
    return;
  }
  try {
    const session = await fetchAdminJson("/api/v1/admin/session");
    setMessage(sessionStatus, `Connected. ${session.totalJobs} jobs visible on the restricted backend.`, "success");
    const payload = await fetchAdminJson("/api/v1/admin/jobs");
    adminJobs = payload.jobs || [];
    renderTable();
    if (selectedJobId) {
      selectJob(selectedJobId);
    }
  } catch (error) {
    console.error(error);
    adminJobs = [];
    clearDetail();
    renderTable();
    setMessage(sessionStatus, error.message || "Could not load the restricted review queue.", "error");
  }
}

async function saveReview(event) {
  event.preventDefault();
  if (!selectedJobId) {
    setMessage(detailStatus, "Select a job first.", "warning");
    return;
  }
  try {
    const payload = {
      adminReviewState: reviewForm.elements.admin_review_state.value,
      includeInPublicUpdate: reviewForm.elements.include_in_public_update.checked,
      publicReleaseCohort: reviewForm.elements.public_release_cohort.value.trim() || null,
      contributorDisplayApproved: reviewForm.elements.contributor_display_approved.checked,
      adminNotes: reviewForm.elements.admin_notes.value.trim() || null,
    };
    const updated = await fetchAdminJson(`/api/v1/admin/jobs/${encodeURIComponent(selectedJobId)}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    adminJobs = adminJobs.map((job) => (job.jobId === updated.jobId ? updated : job));
    selectJob(updated.jobId);
    setMessage(detailStatus, "Admin review decision saved.", "success");
  } catch (error) {
    console.error(error);
    setMessage(detailStatus, error.message || "Could not save the admin review.", "error");
  }
}

async function deleteSelectedJob() {
  if (!selectedJobId) {
    setMessage(detailStatus, "Select a completed or failed job first.", "warning");
    return;
  }
  const confirmed = window.confirm(
    "Delete this local job and its stored files from the restricted backend? This cannot be undone.",
  );
  if (!confirmed) return;
  try {
    await fetch(`${apiBaseUrl()}/api/v1/admin/jobs/${encodeURIComponent(selectedJobId)}`, {
      method: "DELETE",
      headers: adminHeaders(),
    }).then(async (response) => {
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || `Delete failed with status ${response.status}.`);
      }
    });
    adminJobs = adminJobs.filter((job) => job.jobId !== selectedJobId);
    clearDetail();
    renderTable();
    setMessage(sessionStatus, "Local job deleted from the restricted backend.", "success");
  } catch (error) {
    console.error(error);
    setMessage(detailStatus, error.message || "Could not delete the selected job.", "error");
  }
}

async function exportCsv() {
  try {
    const response = await fetch(`${apiBaseUrl()}/api/v1/admin/jobs/export.csv`, {
      headers: adminHeaders(),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.detail || `Export failed with status ${response.status}.`);
    }
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "did-ocr-admin-jobs.csv";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
    setMessage(sessionStatus, "CSV export downloaded.", "success");
  } catch (error) {
    console.error(error);
    setMessage(sessionStatus, error.message || "Could not export CSV.", "error");
  }
}

function renderConfigNote() {
  if (!configuredIntakeUrl()) {
    setMessage(configNote, "Admin surface is unavailable until submissionPortalConfig.intakeUrl points to the restricted backend.", "warning");
    return;
  }
  setMessage(
    configNote,
    "This page uses the same restricted backend as submit/status, but requires a separate admin token.",
    "neutral",
  );
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = tokenInput.value.trim();
  if (!token) {
    setMessage(sessionStatus, "Enter the admin token first.", "warning");
    return;
  }
  setAdminToken(token);
  await refreshAdminJobs();
});

logoutButton.addEventListener("click", () => {
  setAdminToken("");
  tokenInput.value = "";
  adminJobs = [];
  clearDetail();
  renderTable();
  setMessage(sessionStatus, "Admin token cleared from this browser session.", "neutral");
});

refreshButton.addEventListener("click", refreshAdminJobs);
exportButton.addEventListener("click", exportCsv);
searchInput.addEventListener("input", renderTable);
sourceFilter.addEventListener("change", renderTable);
reviewFilter.addEventListener("change", renderTable);
reviewForm.addEventListener("submit", saveReview);
deleteButton.addEventListener("click", deleteSelectedJob);

tokenInput.value = getAdminToken();
renderConfigNote();
renderTable();
if (getAdminToken()) {
  refreshAdminJobs();
}
