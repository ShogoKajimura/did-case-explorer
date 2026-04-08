export const heroBadges = [
  "Corpus freeze · 2026-03-27",
  "219 retained sources",
  "20 languages",
  "42 countries or regions",
  "OCR-aware public boundary",
];

export const contributorDirectory = [
  {
    name: "Shogo Kajimura",
    role: "Project lead",
    affiliation: "DID multilingual case-literature review",
    note: "Corpus curation, coding, OCR quality control, and manuscript development.",
    url: "",
  },
];

export const submissionPortalConfig = {
  intakeUrl: "https://shogomac-studio.taila49884.ts.net/api/v1/public/submissions",
  turnstileSiteKey: "0x4AAAAAAC2O_1XELfNHrhzX",
  maxUploadMb: 150,
  acceptedFileTypes: ".pdf",
  portalStatus: "turnstile_enabled",
  contactEmail: "",
};

export const aggregateCards = [
  {
    label: "Retained sources",
    value: "219",
    note: "Frozen manuscript snapshot",
  },
  {
    label: "Languages",
    value: "20",
    note: "Multilingual corpus scope",
  },
  {
    label: "Countries / regions",
    value: "42",
    note: "Cross-cultural case geography",
  },
  {
    label: "Represented cases",
    value: "1,069",
    note: "Case literature denominator",
  },
  {
    label: "OCR-derived source texts",
    value: "20",
    note: "Handled by two-stage OCR pipeline",
  },
];

export const visualizations = [
  {
    kicker: "Clinical variable",
    title: "Co-consciousness distribution",
    description:
      "Manuscript-aligned counts prepared for future direct snapshot wiring.",
    denominator: "n = 219",
    series: [
      { label: "Yes", value: 34 },
      { label: "Partial", value: 47 },
      { label: "Mixed / variable", value: 10 },
      { label: "Uncertain", value: 3 },
      { label: "No", value: 5 },
      { label: "Not stated", value: 120 },
    ],
  },
  {
    kicker: "Clinical variable",
    title: "Inter-identity amnesia prevalence",
    description:
      "Public-facing bars can be driven directly from a frozen export without exposing source documents.",
    denominator: "n = 219",
    series: [
      { label: "Present", value: 165 },
      { label: "Uncertain / partial", value: 12 },
      { label: "Absent", value: 6 },
      { label: "Not stated", value: 36 },
    ],
  },
  {
    kicker: "Clinical variable",
    title: "Voluntary switching profile",
    description:
      "A good example of a manuscript-ready variable that can support later filtering and figures.",
    denominator: "n = 219",
    series: [
      { label: "Clear yes", value: 6 },
      { label: "Partial / negotiated", value: 13 },
      { label: "Explicitly involuntary", value: 35 },
      { label: "Not stated", value: 164 },
    ],
  },
  {
    kicker: "Treatment frame",
    title: "Treatment goal distribution",
    description:
      "The UI is prepared for figure export, manuscript reproduction, and later live update tracking.",
    denominator: "n = 219",
    series: [
      { label: "Case-formulated goal", value: 69 },
      { label: "Integration / fusion", value: 46 },
      { label: "Safety / stabilization", value: 36 },
      { label: "Not stated", value: 41 },
    ],
  },
];

export const demoRecords = [
  {
    id: "ITA_001",
    title: "The case of Elena",
    country: "Italy",
    language: "Italian / historical interpretation in English",
    languageGroup: "European languages",
    caseStructure: "Single case",
    signalFocus: "Amnesia directionality",
    accessStatus: "Metadata + legal link",
    previewRole: "Historical asymmetry anchor",
    summary:
      "Used in the manuscript as a historical example of unequal autobiographical access across identity states, with clinically salient asymmetry rather than simple reciprocal amnesia.",
    interfaceReason:
      "Demonstrates how the explorer can highlight historically important cases and surface variables central to the paper's novelty claims.",
  },
  {
    id: "JPN_007",
    title: "Bulimia nervosa case with multiple personality symptoms",
    country: "Japan",
    language: "Japanese",
    languageGroup: "East Asian languages",
    caseStructure: "Single case",
    signalFocus: "Co-consciousness",
    accessStatus: "OCR-derived text",
    previewRole: "OCR-dependent phenomenology example",
    summary:
      "Represents an OCR-dependent Japanese source in which internal awareness and observational co-presence are more clinically informative than a simplistic all-or-none memory barrier model.",
    interfaceReason:
      "Useful for validating the public boundary between OCR dependence, legal status, and fine-grained case-variable presentation.",
  },
  {
    id: "TUR_003",
    title: "Dissociative identity disorder case from Turkey",
    country: "Turkey",
    language: "Turkish",
    languageGroup: "Middle East / adjacent regions",
    caseStructure: "Single case",
    signalFocus: "Internal dialogue",
    accessStatus: "Local file / restricted public display",
    previewRole: "Non-English awareness architecture example",
    summary:
      "Included to represent the manuscript's recurrent finding that graded co-consciousness and internal dialogue are not confined to English-language specialty settings.",
    interfaceReason:
      "Supports the future record page pattern for non-English sources that can be coded publicly without redistributing the full text.",
  },
  {
    id: "USA_030",
    title: "Voluntary switching fMRI case",
    country: "United States",
    language: "English",
    languageGroup: "English-language sources",
    caseStructure: "Single case",
    signalFocus: "Voluntary switching",
    accessStatus: "Metadata + coded variables",
    previewRole: "Basic research bridge case",
    summary:
      "Represents the small but important subset of sources in which voluntary or partially negotiated switching is sufficiently explicit to matter for phenotype-based neuroimaging questions.",
    interfaceReason:
      "Helps validate how the explorer can bridge manuscript findings to basic-research hypothesis generation without overstating generalizability.",
  },
  {
    id: "BRA_001",
    title: "Brazilian DID case with internal observational awareness",
    country: "Brazil",
    language: "Portuguese",
    languageGroup: "Latin-script non-English",
    caseStructure: "Single case",
    signalFocus: "Passive co-awareness",
    accessStatus: "Metadata + legal link",
    previewRole: "Cross-linguistic co-consciousness example",
    summary:
      "Included to represent the paper's argument that clinically meaningful co-consciousness signals recur in non-English cases and should not be dismissed as an English-language narrative artifact.",
    interfaceReason:
      "Provides a good test case for multilingual filtering, access-state labeling, and variable-forward browsing.",
  },
  {
    id: "KOR_007",
    title: "Open Korean DID case literature example",
    country: "South Korea",
    language: "Korean",
    languageGroup: "East Asian languages",
    caseStructure: "Single case",
    signalFocus: "Diagnostic ecology",
    accessStatus: "Open-access source",
    previewRole: "Open-public exemplar",
    summary:
      "Represents a case that can later anchor the explorer's distinction between openly linkable records and restricted materials while still surfacing diagnostic pathway information.",
    interfaceReason:
      "Important for validating the UI state in which both metadata and a legally public source link can be shown together.",
  },
  {
    id: "ZAF_001",
    title: "Case of co-conscious personalities",
    country: "South Africa",
    language: "English",
    languageGroup: "English-language sources",
    caseStructure: "Single case",
    signalFocus: "Historical co-consciousness",
    accessStatus: "Public-domain historical text",
    previewRole: "Archival discoverability example",
    summary:
      "Used here to represent older, historically important case materials whose discoverability improves substantially once they are placed inside a common registry with clear access labeling.",
    interfaceReason:
      "Validates the visual language for public-domain historical items and the archival side of the resource identity.",
  },
  {
    id: "MYS_003",
    title: "Adolescent DID case series",
    country: "Malaysia",
    language: "English",
    languageGroup: "English-language sources",
    caseStructure: "Case series",
    signalFocus: "Treatment and trajectory",
    accessStatus: "Publisher-hosted full text",
    previewRole: "Series-level trajectory example",
    summary:
      "Represents how the explorer can later differentiate single cases from case series and support pathway-level synthesis around treatment framing and outcome trajectories.",
    interfaceReason:
      "Useful for validating filtering by structure and later connecting table views to comparative visual summaries.",
  },
];
