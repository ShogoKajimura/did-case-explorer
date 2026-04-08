const FALLBACK_AGGREGATES = {
  snapshot: {
    version: "preview-shell",
  },
  heroBadges: [
    "Preview shell",
    "Metadata boundary",
    "Static deploy target",
  ],
  aggregateCards: [
    { label: "Retained sources", value: "0", note: "Load failed" },
    { label: "Languages", value: "0", note: "Load failed" },
    { label: "Countries / regions", value: "0", note: "Load failed" },
    { label: "Represented cases", value: "0", note: "Load failed" },
    { label: "OCR-managed records", value: "0", note: "Load failed" },
  ],
  visualizations: [],
};

const searchInput = document.querySelector("#search");
const languageFilter = document.querySelector("#language-filter");
const structureFilter = document.querySelector("#structure-filter");
const accessFilter = document.querySelector("#access-filter");
const signalFilter = document.querySelector("#signal-filter");
const resetButton = document.querySelector("#reset-filters");
const statCards = document.querySelector("#stat-cards");
const heroBadgeContainer = document.querySelector("#hero-badges");
const recordTableBody = document.querySelector("#record-table-body");
const emptyState = document.querySelector("#empty-state");
const resultsCount = document.querySelector("#results-count");
const detailTitle = document.querySelector("#detail-title");
const detailContent = document.querySelector("#detail-content");
const visualCards = document.querySelector("#visual-cards");
const snapshotPill = document.querySelector("#snapshot-pill");

const state = {
  query: "",
  language: "all",
  structure: "all",
  access: "all",
  signal: "all",
  selectedId: null,
};

let aggregates = FALLBACK_AGGREGATES;
let records = [];

function normalizeLabel(value) {
  return value
    .replaceAll("_", " ")
    .replaceAll("/", " / ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function slugValue(value) {
  return value.trim().toLowerCase();
}

function uniqueValues(key) {
  return [...new Set(records.map((record) => record[key]).filter(Boolean))].sort();
}

function appendOptions(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function renderHeroBadges() {
  heroBadgeContainer.innerHTML = "";
  aggregates.heroBadges.forEach((badge) => {
    const span = document.createElement("span");
    span.className = "pill";
    span.textContent = badge;
    heroBadgeContainer.append(span);
  });
}

function renderStatCards() {
  statCards.innerHTML = "";
  aggregates.aggregateCards.forEach((card) => {
    const article = document.createElement("article");
    article.innerHTML = `
      <span class="stat-label">${card.label}</span>
      <div class="stat-value">${card.value}</div>
      <div class="stat-note">${card.note}</div>
    `;
    statCards.append(article);
  });
}

function buildBarRow(item, maxValue) {
  const row = document.createElement("div");
  row.className = "bar-row";
  const percentage = maxValue === 0 ? 0 : (item.value / maxValue) * 100;
  row.innerHTML = `
    <div class="bar-label">
      <span>${normalizeLabel(item.label)}</span>
      <strong>${item.value}</strong>
    </div>
    <div class="bar-track">
      <div class="bar-fill" style="width: ${percentage}%"></div>
    </div>
  `;
  return row;
}

function renderVisualCards() {
  visualCards.innerHTML = "";
  aggregates.visualizations.forEach((card) => {
    const article = document.createElement("article");
    article.className = "visual-card";
    const maxValue = Math.max(...card.series.map((item) => item.value), 0);
    article.innerHTML = `
      <div class="visual-card-header">
        <div>
          <p class="eyebrow">${card.kicker}</p>
          <h3>${card.title}</h3>
          <p>${card.description}</p>
        </div>
        <span class="pill">${card.denominator}</span>
      </div>
    `;
    const list = document.createElement("div");
    list.className = "bar-list";
    card.series.forEach((item) => list.append(buildBarRow(item, maxValue)));
    article.append(list);
    visualCards.append(article);
  });
}

function getFilteredRecords() {
  return records.filter((record) => {
    const haystack = [
      record.id,
      record.title,
      record.authors,
      record.journal,
      record.country,
      record.language,
      record.accessLabel,
      record.recordType,
      record.variables.coConsciousness,
      record.variables.amnesia,
      record.variables.amnesiaDirectionality,
      record.variables.voluntarySwitching,
      record.variables.treatmentGoal,
      record.variables.outcome,
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = haystack.includes(state.query.toLowerCase());
    const matchesLanguage =
      state.language === "all" || record.languageGroup === state.language;
    const matchesStructure =
      state.structure === "all" || record.recordType === state.structure;
    const matchesAccess =
      state.access === "all" || record.accessLabel === state.access;
    const matchesSignal =
      state.signal === "all" ||
      [
        record.variables.coConsciousness,
        record.variables.amnesiaDirectionality,
        record.variables.voluntarySwitching,
        record.variables.treatmentGoal,
        record.variables.outcome,
      ].includes(state.signal);

    return (
      matchesQuery &&
      matchesLanguage &&
      matchesStructure &&
      matchesAccess &&
      matchesSignal
    );
  });
}

function renderDetail(record) {
  if (!record) {
    detailTitle.textContent = "Select a record";
    detailContent.innerHTML = `
      <p>
        Select a record to inspect its public metadata, coded-variable profile,
        and access status.
      </p>
    `;
    return;
  }

  const linkHtml = record.publicLinkUrl
    ? `<a class="button button-secondary" href="${record.publicLinkUrl}" target="_blank" rel="noreferrer">Open external record page</a>`
    : `<span class="pill">No public external link recorded</span>`;

  detailTitle.textContent = `${record.id} · ${record.title}`;
  detailContent.innerHTML = `
    <div class="detail-block">
      <div class="detail-grid">
        <div><span>Authors</span><strong>${record.authors || "Not stated"}</strong></div>
        <div><span>Year</span><strong>${record.year || "Not stated"}</strong></div>
        <div><span>Journal</span><strong>${record.journal || "Not stated"}</strong></div>
        <div><span>Country</span><strong>${record.country}</strong></div>
        <div><span>Language</span><strong>${record.language}</strong></div>
        <div><span>Case structure</span><strong>${record.recordType}</strong></div>
        <div><span>Case shape</span><strong>${record.caseShape}</strong></div>
        <div><span>Case count</span><strong>${record.caseCount || "Not stated"}</strong></div>
        <div><span>Access status</span><strong>${record.accessLabel}</strong></div>
        <div><span>DOI</span><strong>${record.doi || "Not stated"}</strong></div>
      </div>
    </div>
    <div class="detail-block">
      <h4>Coded variable profile</h4>
      <div class="detail-grid">
        <div><span>Co-consciousness</span><strong>${normalizeLabel(record.variables.coConsciousness)}</strong></div>
        <div><span>Amnesia</span><strong>${normalizeLabel(record.variables.amnesia)}</strong></div>
        <div><span>Amnesia directionality</span><strong>${normalizeLabel(record.variables.amnesiaDirectionality)}</strong></div>
        <div><span>Voluntary switching</span><strong>${normalizeLabel(record.variables.voluntarySwitching)}</strong></div>
        <div><span>Treatment goal</span><strong>${normalizeLabel(record.variables.treatmentGoal)}</strong></div>
        <div><span>Outcome</span><strong>${normalizeLabel(record.variables.outcome)}</strong></div>
        <div><span>Diagnostic delay (years)</span><strong>${record.variables.diagnosticDelayYears || "Not stated"}</strong></div>
        <div><span>Psychosis differential</span><strong>${normalizeLabel(record.variables.psychosisPriorOrDifferential)}</strong></div>
      </div>
    </div>
    <div class="detail-block">
      <h4>Access and reuse note</h4>
      <p>
        This public companion resource exposes metadata and coded variables. It does
        not redistribute copyrighted full text unless clearly permissible.
      </p>
      ${linkHtml}
    </div>
  `;
}

function renderTable() {
  const filtered = getFilteredRecords();
  resultsCount.textContent = `${filtered.length} record${filtered.length === 1 ? "" : "s"} in the frozen public snapshot`;
  recordTableBody.innerHTML = "";
  emptyState.hidden = filtered.length !== 0;

  if (filtered.length === 0) {
    renderDetail(null);
    return;
  }

  if (!filtered.some((record) => record.id === state.selectedId)) {
    state.selectedId = filtered[0].id;
  }

  filtered.forEach((record) => {
    const row = document.createElement("tr");
    row.tabIndex = 0;
    row.className = record.id === state.selectedId ? "is-selected" : "";
    row.innerHTML = `
      <td>
        <div class="record-title">
          <strong>${record.id}</strong>
          <small>${record.title}</small>
        </div>
      </td>
      <td>
        <div>${record.language}</div>
        <small>${record.country}</small>
      </td>
      <td>${record.recordType}</td>
      <td><span class="tag">${normalizeLabel(record.variables.coConsciousness)}</span></td>
      <td><span class="tag">${record.accessLabel}</span></td>
    `;
    row.addEventListener("click", () => {
      state.selectedId = record.id;
      renderTable();
    });
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        state.selectedId = record.id;
        renderTable();
      }
    });
    recordTableBody.append(row);
  });

  renderDetail(filtered.find((record) => record.id === state.selectedId) || null);
}

function syncStateFromInputs() {
  state.query = searchInput.value.trim();
  state.language = languageFilter.value;
  state.structure = structureFilter.value;
  state.access = accessFilter.value;
  state.signal = signalFilter.value;
  renderTable();
}

function resetFilters() {
  state.query = "";
  state.language = "all";
  state.structure = "all";
  state.access = "all";
  state.signal = "all";

  searchInput.value = "";
  languageFilter.value = "all";
  structureFilter.value = "all";
  accessFilter.value = "all";
  signalFilter.value = "all";

  renderTable();
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

function populateFilters() {
  appendOptions(languageFilter, uniqueValues("languageGroup"));
  appendOptions(structureFilter, uniqueValues("recordType"));
  appendOptions(accessFilter, uniqueValues("accessLabel"));

  const signalOptions = new Set();
  for (const record of records) {
    for (const value of [
      record.variables.coConsciousness,
      record.variables.amnesiaDirectionality,
      record.variables.voluntarySwitching,
      record.variables.treatmentGoal,
      record.variables.outcome,
    ]) {
      if (value && value !== "not_stated") {
        signalOptions.add(value);
      }
    }
  }
  appendOptions(signalFilter, [...signalOptions].sort().map(normalizeLabel));

  const signalMap = new Map(
    [...signalOptions].sort().map((value) => [normalizeLabel(value), value]),
  );

  signalFilter.addEventListener("change", () => {
    state.signal = signalFilter.value === "all" ? "all" : signalMap.get(signalFilter.value);
    renderTable();
  });
}

async function init() {
  try {
    [aggregates, records] = await Promise.all([
      loadJson("./data/public-aggregates-2026-03-27.json"),
      loadJson("./data/public-records-2026-03-27.json"),
    ]);
  } catch (error) {
    console.error(error);
    detailTitle.textContent = "Snapshot load failed";
    detailContent.innerHTML = `
      <p>
        The public snapshot files could not be loaded. Check that the JSON
        exports exist in <code>data/</code> and were deployed to GitHub Pages.
      </p>
    `;
  }

  renderHeroBadges();
  renderStatCards();
  renderVisualCards();
  snapshotPill.textContent = `Version ${aggregates.snapshot.version}`;

  if (records.length > 0) {
    populateFilters();
  }

  renderTable();

  [searchInput, languageFilter, structureFilter, accessFilter].forEach((element) => {
    element.addEventListener("input", syncStateFromInputs);
    element.addEventListener("change", syncStateFromInputs);
  });

  resetButton.addEventListener("click", resetFilters);
}

init();
