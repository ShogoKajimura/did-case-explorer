import { aggregateCards, demoRecords, heroBadges, visualizations } from "./data/site-data.js";

const state = {
  query: "",
  language: "all",
  structure: "all",
  access: "all",
  signal: "all",
  selectedId: null,
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

function uniqueValues(key) {
  return [...new Set(demoRecords.map((record) => record[key]))].sort();
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
  heroBadges.forEach((badge) => {
    const span = document.createElement("span");
    span.className = "pill";
    span.textContent = badge;
    heroBadgeContainer.append(span);
  });
}

function renderStatCards() {
  statCards.innerHTML = "";
  aggregateCards.forEach((card) => {
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
      <span>${item.label}</span>
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
  visualizations.forEach((card) => {
    const article = document.createElement("article");
    article.className = "visual-card";
    const maxValue = Math.max(...card.series.map((item) => item.value));
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
  return demoRecords.filter((record) => {
    const haystack = [
      record.id,
      record.title,
      record.country,
      record.language,
      record.signalFocus,
      record.accessStatus,
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = haystack.includes(state.query.toLowerCase());
    const matchesLanguage =
      state.language === "all" || record.languageGroup === state.language;
    const matchesStructure =
      state.structure === "all" || record.caseStructure === state.structure;
    const matchesAccess =
      state.access === "all" || record.accessStatus === state.access;
    const matchesSignal =
      state.signal === "all" || record.signalFocus === state.signal;

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
        The full corpus snapshot can later populate this panel with metadata,
        coding outputs, provenance notes, and legal access status without changing
        the UI contract.
      </p>
    `;
    return;
  }

  detailTitle.textContent = `${record.id} · ${record.title}`;
  detailContent.innerHTML = `
    <div class="detail-block">
      <div class="detail-grid">
        <div><span>Country</span><strong>${record.country}</strong></div>
        <div><span>Language</span><strong>${record.language}</strong></div>
        <div><span>Case structure</span><strong>${record.caseStructure}</strong></div>
        <div><span>Access status</span><strong>${record.accessStatus}</strong></div>
        <div><span>Signal focus</span><strong>${record.signalFocus}</strong></div>
        <div><span>Preview role</span><strong>${record.previewRole}</strong></div>
      </div>
    </div>
    <div class="detail-block">
      <h4>Clinical summary</h4>
      <p>${record.summary}</p>
    </div>
    <div class="detail-block">
      <h4>Why this record is in the interface preview</h4>
      <p>${record.interfaceReason}</p>
    </div>
    <div class="detail-block">
      <h4>Future real-data slot</h4>
      <p>
        This panel is designed to receive frozen-snapshot fields such as coded
        variable provenance, access notes, open-link status, OCR dependence, and
        manuscript-aligned figure memberships.
      </p>
    </div>
  `;
}

function renderTable() {
  const filtered = getFilteredRecords();
  resultsCount.textContent = `${filtered.length} representative record${filtered.length === 1 ? "" : "s"}`;
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
      <td>${record.caseStructure}</td>
      <td><span class="tag">${record.signalFocus}</span></td>
      <td><span class="tag">${record.accessStatus}</span></td>
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

function init() {
  appendOptions(languageFilter, uniqueValues("languageGroup"));
  appendOptions(structureFilter, uniqueValues("caseStructure"));
  appendOptions(accessFilter, uniqueValues("accessStatus"));
  appendOptions(signalFilter, uniqueValues("signalFocus"));

  renderHeroBadges();
  renderStatCards();
  renderVisualCards();
  renderTable();

  [searchInput, languageFilter, structureFilter, accessFilter, signalFilter].forEach(
    (element) => {
      element.addEventListener("input", syncStateFromInputs);
      element.addEventListener("change", syncStateFromInputs);
    },
  );

  resetButton.addEventListener("click", resetFilters);
}

init();
