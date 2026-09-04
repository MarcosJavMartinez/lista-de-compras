"use strict";

/* ==========================================================================
   Marca
   ========================================================================== */

// Datos de identidad de marca, centralizados para no repetir strings sueltos.
// donationUrl/websiteUrl quedan vacíos hasta que Neko Tools tenga esos
// enlaces: mientras tanto los botones/links correspondientes se deshabilitan
// solos en vez de apuntar a una URL inventada.
const BRAND = {
  companyName: "Neko Tools",
  appName: "Neko Lista",
  tagline: "Tu lista. Tu presupuesto. Sin complicaciones.",
  donationUrl: "",
  websiteUrl: "",
};

/* ==========================================================================
   Constantes y estado
   ========================================================================== */

const STORAGE_KEY = "listaCompras.productos";
const THEME_KEY = "listaCompras.theme";
const BG_COLOR_KEY = "listaCompras.bgColor";
const PALETTE_KEY = "listaCompras.palette";
const CUSTOM_COLOR_KEY = "listaCompras.customColor";

const SVG_ICON_SUN =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
const SVG_ICON_MOON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
const BG_IMAGE_CHOICE_KEY = "listaCompras.bgImageChoice";
const BG_IMAGE_CUSTOM_KEY = "listaCompras.bgImageCustom";
const DEFAULT_BG_LIGHT = "#f5f3ee";
const DEFAULT_BG_DARK = "#10140e";
const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

// Seis plantillas de color bien diferenciadas. Cada una define el acento
// (primario) para modo día y modo noche; el resto de la paleta (fondos,
// tarjetas, bordes) no cambia, solo el color de marca en toda la app.
const COLOR_PALETTES = [
  {
    id: "verde",
    label: "Verde",
    swatch: "#2f9e44",
    light: { primary: "#2f9e44", primaryDark: "#1f7a34", primarySoft: "#e8f4ea" },
    dark: { primary: "#52c374", primaryDark: "#3a9c58", primarySoft: "#1e2b20" },
  },
  {
    id: "oceano",
    label: "Océano",
    swatch: "#1c7ed6",
    light: { primary: "#1c7ed6", primaryDark: "#145a9e", primarySoft: "#e3f1fc" },
    dark: { primary: "#4dabf7", primaryDark: "#2f8fd6", primarySoft: "#132534" },
  },
  {
    id: "atardecer",
    label: "Atardecer",
    swatch: "#e8590c",
    light: { primary: "#e8590c", primaryDark: "#b7440a", primarySoft: "#fdebe0" },
    dark: { primary: "#ff922b", primaryDark: "#e8720f", primarySoft: "#3a2415" },
  },
  {
    id: "uva",
    label: "Uva",
    swatch: "#7048c2",
    light: { primary: "#7048c2", primaryDark: "#56349c", primarySoft: "#f0e9fb" },
    dark: { primary: "#a389f0", primaryDark: "#8264d6", primarySoft: "#251c3a" },
  },
  {
    id: "frambuesa",
    label: "Frambuesa",
    swatch: "#e64980",
    light: { primary: "#e64980", primaryDark: "#b93867", primarySoft: "#fde3ee" },
    dark: { primary: "#f783ac", primaryDark: "#e0628e", primarySoft: "#3a1f28" },
  },
  {
    id: "grafito",
    label: "Grafito",
    swatch: "#495057",
    light: { primary: "#495057", primaryDark: "#343a40", primarySoft: "#eef0f1" },
    dark: { primary: "#adb5bd", primaryDark: "#868e96", primarySoft: "#22262a" },
  },
];

// Patrón de fondo por defecto: siluetas de comida (manzana, pan, caja de
// leche, muslo de pollo, baguette) desperdigadas como textura sutil.
// Imágenes provistas por el usuario (generadas con IA): frutas, panificados,
// carnes, leche y baquitas dibujadas como contornos, una versión por tema.
const FOOD_PATTERN_LIGHT = "img/bg-pattern-light.jpg";
const FOOD_PATTERN_DARK = "img/bg-pattern-dark.jpg";

const DEFAULT_ICON = "🛒";
const DEFAULT_CATEGORY = "Otros";

const CATEGORY_COLORS = {
  "Verdulería": { bg: "#eef2d1", fg: "#5a6b1f" },
  "Carnicería": { bg: "#fbe4e4", fg: "#b3261e" },
  "Panadería": { bg: "#f6e9d8", fg: "#8a5a2b" },
  "Almacén": { bg: "#e0f0f5", fg: "#1f6d7a" },
  "Limpieza": { bg: "#ede4f7", fg: "#6a3fa0" },
  "Farmacia y Perfumería": { bg: "#fbe4ef", fg: "#a0356a" },
  Otros: { bg: "#ececeb", fg: "#6c757d" },
};

// Se evalúa en orden: la primera coincidencia de palabra clave gana.
// Cada regla asocia un producto a un ícono y a la categoría donde se suele comprar.
const PRODUCT_RULES = [
  { keywords: ["huevo"], icon: "🥚", category: "Almacén" },
  { keywords: ["afeitar", "gillette", "rasuradora", "maquinita"], icon: "🪒", category: "Farmacia y Perfumería" },
  { keywords: ["crema de afeitar"], icon: "🪒", category: "Farmacia y Perfumería" },
  { keywords: ["jabon para ropa", "jabón para ropa"], icon: "🧺", category: "Limpieza" },
  { keywords: ["jabon", "jabón"], icon: "🧼", category: "Farmacia y Perfumería" },
  { keywords: ["aceite"], icon: "🫒", category: "Almacén" },
  { keywords: ["leche"], icon: "🥛", category: "Almacén" },
  { keywords: ["yogur", "yogurt"], icon: "🥣", category: "Almacén" },
  { keywords: ["cafe", "café"], icon: "☕", category: "Almacén" },
  { keywords: ["azucar", "azúcar"], icon: "🧂", category: "Almacén" },
  { keywords: ["manteca", "margarina"], icon: "🧈", category: "Almacén" },
  { keywords: ["queso"], icon: "🧀", category: "Almacén" },
  { keywords: ["caldo", "sopa"], icon: "🍲", category: "Almacén" },
  { keywords: ["rollo de cocina", "rollos de cocina", "papel cocina"], icon: "🧻", category: "Limpieza" },
  { keywords: ["papel higienico", "papel higiénico"], icon: "🧻", category: "Limpieza" },
  { keywords: ["pasta dental", "dentifrico", "dentífrico"], icon: "🪥", category: "Farmacia y Perfumería" },
  { keywords: ["cepillo de dientes"], icon: "🪥", category: "Farmacia y Perfumería" },
  { keywords: ["pañuelos descartables"], icon: "🤧", category: "Limpieza" },
  { keywords: ["pan lactal", "pan"], icon: "🍞", category: "Panadería" },
  { keywords: ["fideos", "tallarin", "tallarín", "ravioles", "ñoquis"], icon: "🍝", category: "Almacén" },
  { keywords: ["arroz"], icon: "🍚", category: "Almacén" },
  { keywords: ["pure de tomate", "puré de tomate", "salsa de tomate"], icon: "🍅", category: "Almacén" },
  { keywords: ["tomate"], icon: "🍅", category: "Verdulería" },
  { keywords: ["atun", "atún"], icon: "🐟", category: "Carnicería" },
  { keywords: ["pescado", "merluza", "salmon", "salmón"], icon: "🐟", category: "Carnicería" },
  { keywords: ["pollo"], icon: "🍗", category: "Carnicería" },
  { keywords: ["carne", "milanesa", "asado", "bife"], icon: "🥩", category: "Carnicería" },
  { keywords: ["lavandina", "cloro"], icon: "🧴", category: "Limpieza" },
  { keywords: ["detergente", "limpiador", "desinfectante", "lysoform", "pino luz", "pinolux"], icon: "🧴", category: "Limpieza" },
  { keywords: ["suavizante"], icon: "🧴", category: "Limpieza" },
  { keywords: ["esponja"], icon: "🧽", category: "Limpieza" },
  { keywords: ["birulana"], icon: "🧽", category: "Limpieza" },
  { keywords: ["mopa"], icon: "🧹", category: "Limpieza" },
  { keywords: ["trapo de piso"], icon: "🧹", category: "Limpieza" },
  { keywords: ["plumero"], icon: "🪶", category: "Limpieza" },
  { keywords: ["perfume para ropa"], icon: "🌸", category: "Limpieza" },
  { keywords: ["ala para lavar ropa"], icon: "🧺", category: "Limpieza" },
  { keywords: ["shampoo", "champú", "champu", "acondicionador"], icon: "🧴", category: "Farmacia y Perfumería" },
  { keywords: ["desodorante"], icon: "🧴", category: "Farmacia y Perfumería" },
  { keywords: ["talco"], icon: "🧴", category: "Farmacia y Perfumería" },
  { keywords: ["preservativos"], icon: "🛡️", category: "Farmacia y Perfumería" },
  { keywords: ["vitamina"], icon: "💊", category: "Farmacia y Perfumería" },
  { keywords: ["enjuague dental", "hilo dental"], icon: "🪥", category: "Farmacia y Perfumería" },
  { keywords: ["crema", "pomada", "alergia"], icon: "💊", category: "Farmacia y Perfumería" },
  { keywords: ["cebolla"], icon: "🧅", category: "Verdulería" },
  { keywords: ["mayo de ajo"], icon: "🧄", category: "Almacén" },
  { keywords: ["ajo"], icon: "🧄", category: "Verdulería" },
  { keywords: ["morron", "morrón", "pimiento"], icon: "🫑", category: "Verdulería" },
  { keywords: ["aji molido", "ají molido", "pimenton", "pimentón", "picante"], icon: "🌶️", category: "Almacén" },
  { keywords: ["jengibre"], icon: "🫚", category: "Verdulería" },
  { keywords: ["bolson de verduras", "bolsón de verduras"], icon: "🥦", category: "Verdulería" },
  { keywords: ["papa", "patata"], icon: "🥔", category: "Verdulería" },
  { keywords: ["zanahoria"], icon: "🥕", category: "Verdulería" },
  { keywords: ["manzana"], icon: "🍎", category: "Verdulería" },
  { keywords: ["banana", "platano", "plátano"], icon: "🍌", category: "Verdulería" },
  { keywords: ["naranja"], icon: "🍊", category: "Verdulería" },
  { keywords: ["limon", "limón"], icon: "🍋", category: "Verdulería" },
  { keywords: ["palta", "aguacate"], icon: "🥑", category: "Verdulería" },
  { keywords: ["lechuga"], icon: "🥬", category: "Verdulería" },
  { keywords: ["manzanilla"], icon: "🌼", category: "Almacén" },
  { keywords: ["hierbas digestivas"], icon: "🌿", category: "Almacén" },
  { keywords: ["yerba"], icon: "🧉", category: "Almacén" },
  { keywords: ["agua"], icon: "💧", category: "Almacén" },
  { keywords: ["gaseosa", "cola", "sprite", "fanta"], icon: "🥤", category: "Almacén" },
  { keywords: ["cerveza"], icon: "🍺", category: "Almacén" },
  { keywords: ["vino"], icon: "🍷", category: "Almacén" },
  { keywords: ["chocolate"], icon: "🍫", category: "Almacén" },
  { keywords: ["galletita", "galleta"], icon: "🍪", category: "Almacén" },
  { keywords: ["pure instantaneo", "puré instantáneo"], icon: "🥔", category: "Almacén" },
  { keywords: ["mister musculo", "mister músculo"], icon: "🧴", category: "Limpieza" },
  { keywords: ["mayoliva"], icon: "🫒", category: "Almacén" },
  { keywords: ["bicarbonato"], icon: "🧂", category: "Almacén" },
  { keywords: ["vinagre"], icon: "🍶", category: "Almacén" },
  { keywords: ["miel"], icon: "🍯", category: "Almacén" },
  { keywords: ["sal fina", "sal gruesa"], icon: "🧂", category: "Almacén" },
  { keywords: ["capuchino"], icon: "☕", category: "Almacén" },
  { keywords: ["escarbadientes"], icon: "🥢", category: "Almacén" },
  { keywords: ["salchicha"], icon: "🌭", category: "Carnicería" },
  { keywords: ["cinta adhesiva"], icon: "🧷", category: "Otros" },
  { keywords: ["boxer", "bóxer"], icon: "👖", category: "Otros" },
];

const ALL_ICONS = Array.from(new Set([DEFAULT_ICON, ...PRODUCT_RULES.map((rule) => rule.icon)]));

const DIACRITICS_REGEX = new RegExp("[̀-ͯ]", "g");

function normalizeText(str) {
  return str.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "");
}

function matchProductRule(name) {
  const normalized = normalizeText(name);
  return PRODUCT_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
  );
}

function getProductIcon(name) {
  const rule = matchProductRule(name);
  return rule ? rule.icon : DEFAULT_ICON;
}

function getProductCategory(name) {
  const rule = matchProductRule(name);
  return rule ? rule.category : DEFAULT_CATEGORY;
}

const DEFAULT_PRODUCTS = [
  { name: "Maple de huevos", quantity: 1, price: 6500 },
  { name: "Máquina de afeitar Gillette x3", quantity: 1, price: 5895 },
  { name: "Jabón Dove", quantity: 1, price: 2350 },
  { name: "Aceite Cañuelas 900 ml", quantity: 1, price: 4115 },
  { name: "Leche Tregar 1 L", quantity: 1, price: 2150 },
  { name: "Café La Virginia 100 g", quantity: 1, price: 3500 },
  { name: "Azúcar 1 kg", quantity: 1, price: 2200 },
  { name: "Manteca 200 g", quantity: 1, price: 3484.15 },
  { name: "Caldo de verduras x12", quantity: 1, price: 1879 },
  { name: "Rollos de cocina x3", quantity: 1, price: 2343.2 },
  { name: "Papel higiénico x4", quantity: 1, price: 3231.2 },
  { name: "Pasta dental Colgate", quantity: 1, price: 3900 },
  { name: "Pan lactal Bimbo integral", quantity: 1, price: 4293 },
  { name: "Puré de tomate", quantity: 1, price: 1110 },
  { name: "Atún", quantity: 2, price: 1750 },
  { name: "Lavandina", quantity: 1, price: 1850 },
  { name: "1 kg de cebolla", quantity: 1, price: 2000 },
  { name: "2 cabezas de ajo", quantity: 1, price: 900 },
  { name: "1 morrón", quantity: 1, price: 1200 },
  { name: "Ají molido", quantity: 1, price: 2200 },
  { name: "Pinolux", quantity: 1, price: 2800 },
  { name: "Queso para untar", quantity: 1, price: 3200 },
  { name: "Crema para alergia", quantity: 1, price: 4500 },
  { name: "Arroz", quantity: 1, price: 4580 },
  { name: "Fideos x3", quantity: 1, price: 3600 },
  { name: "Puré instantáneo", quantity: 1, price: 2800 },
  { name: "Mister Músculo baño", quantity: 1, price: 4200 },
  { name: "Mister Músculo cocina", quantity: 1, price: 4200 },
  { name: "Té de hierbas digestivas", quantity: 1, price: 2600 },
  { name: "Pan sin TACC", quantity: 1, price: 6500 },
  { name: "Bolsón de verduras", quantity: 1, price: 8000 },
  { name: "Jabón para ropa", quantity: 1, price: 1800 },
  { name: "Mayo de ajo", quantity: 1, price: 2400 },
  { name: "Queso untable Roquefort", quantity: 1, price: 4800 },
  { name: "Bicarbonato", quantity: 1, price: 1500 },
  { name: "Vinagre de alcohol", quantity: 1, price: 1400 },
  { name: "Cabezal de mopa", quantity: 1, price: 5500 },
  { name: "Preservativos", quantity: 1, price: 4200 },
  { name: "Miel sólida", quantity: 1, price: 3800 },
  { name: "Cinta adhesiva papel/clásica", quantity: 1, price: 2100 },
  { name: "Bóxer", quantity: 1, price: 6500 },
  { name: "Salchichas", quantity: 1, price: 2900 },
  { name: "Mayoliva", quantity: 1, price: 2600 },
  { name: "Aceite de oliva", quantity: 1, price: 7500 },
  { name: "Jengibre", quantity: 1, price: 1800 },
  { name: "Talco", quantity: 1, price: 2400 },
  { name: "Detergente", quantity: 1, price: 3000 },
  { name: "Trapo de piso", quantity: 1, price: 2200 },
  { name: "Pañuelos descartables", quantity: 1, price: 2100 },
  { name: "Sal fina", quantity: 1, price: 1200 },
  { name: "Birulana", quantity: 1, price: 1900 },
  { name: "Capuchino", quantity: 1, price: 3500 },
  { name: "Blen original", quantity: 1, price: 4500 },
  { name: "Vitamina C", quantity: 3, price: 2800 },
  { name: "Escarbadientes", quantity: 1, price: 900 },
  { name: "Crema de afeitar", quantity: 1, price: 3600 },
  { name: "Esponja", quantity: 1, price: 1300 },
  { name: "Desodorante spray", quantity: 1, price: 4200 },
  { name: "Ala para lavar ropa", quantity: 1, price: 5200 },
  { name: "Miel líquida", quantity: 1, price: 3600 },
  { name: "Cepillo para zapatos", quantity: 1, price: 2800 },
  { name: "Enjuague dental", quantity: 1, price: 4200 },
  { name: "Hilo dental", quantity: 1, price: 2300 },
  { name: "Limón", quantity: 1, price: 1800 },
  { name: "Té de manzanilla", quantity: 1, price: 2400 },
  { name: "Plumero", quantity: 1, price: 3800 },
  { name: "Perfume para ropa", quantity: 1, price: 5500 },
].map((item) => ({
  id: generateId(),
  name: item.name,
  quantity: item.quantity,
  price: item.price,
  purchased: false,
  category: getProductCategory(item.name),
  priority: false,
}));

const CATALOG_VERSION = 3;
const CATALOG_VERSION_KEY = "listaCompras.catalogVersion";

let products = [];
let currentFilter = "all";
let searchQuery = "";
let filterCategory = "";
let filterPriorityOnly = false;
let sortPriceOrder = null; // null | "desc" | "asc"
let manualIcon = null;

/* ==========================================================================
   Referencias del DOM
   ========================================================================== */

const btnThemeToggle = document.getElementById("btn-theme-toggle");
const btnSettingsToggle = document.getElementById("btn-settings-toggle");
const settingsBackdrop = document.getElementById("settings-backdrop");
const btnSettingsClose = document.getElementById("btn-settings-close");
const supportBackdrop = document.getElementById("support-backdrop");
const btnSupportProject = document.getElementById("btn-support-project");
const btnFooterSupport = document.getElementById("btn-footer-support");
const btnSupportClose = document.getElementById("btn-support-close");
const btnDonate = document.getElementById("btn-donate");
const donateStatus = document.getElementById("donate-status");
const footerMoreTools = document.getElementById("footer-more-tools");
const themeOptionButtons = document.querySelectorAll(".theme-option");
const btnExportData = document.getElementById("btn-export-data");
const inputImportData = document.getElementById("input-import-data");
const ioTabButtons = document.querySelectorAll(".io-tab");
const ioPanels = document.querySelectorAll(".io-panel");
const pasteListTextarea = document.getElementById("paste-list-textarea");
const btnCopyListText = document.getElementById("btn-copy-list-text");
const btnCreateFromText = document.getElementById("btn-create-from-text");
const pasteListStatus = document.getElementById("paste-list-status");
const btnExportPdf = document.getElementById("btn-export-pdf");
const inputImportPdf = document.getElementById("input-import-pdf");
const pdfStatus = document.getElementById("pdf-status");
const btnExportImage = document.getElementById("btn-export-image");
const inputImportImage = document.getElementById("input-import-image");
const imageStatus = document.getElementById("image-status");
const inputBgColor = document.getElementById("input-bg-color");
const btnResetBg = document.getElementById("btn-reset-bg");
const paletteRow = document.getElementById("palette-row");
const bgImageOptionButtons = document.querySelectorAll(".bg-image-option[data-bg-choice]");
const inputBgImage = document.getElementById("input-bg-image");
const bgImageStatusEl = document.getElementById("bg-image-status");

const addForm = document.getElementById("add-form");
const inputName = document.getElementById("input-name");
const inputQuantity = document.getElementById("input-quantity");
const inputPrice = document.getElementById("input-price");
const inputIconPreview = document.getElementById("input-icon-preview");
const addIconPickerSlot = document.getElementById("add-icon-picker-slot");
const btnShowAddForm = document.getElementById("btn-show-add-form");
const btnCancelAdd = document.getElementById("btn-cancel-add");

const searchInput = document.getElementById("search-input");
const btnToggleFilters = document.getElementById("btn-toggle-filters");
const filtersPanel = document.getElementById("filters-panel");
const filterCategorySelect = document.getElementById("filter-category");
const filterPriorityCheckbox = document.getElementById("filter-priority");
const btnSortPrice = document.getElementById("btn-sort-price");
const btnClearFilters = document.getElementById("btn-clear-filters");

const pendingGroupEl = document.getElementById("pending-group");
const pendingListEl = document.getElementById("pending-list");
const purchasedGroupEl = document.getElementById("purchased-group");
const purchasedListEl = document.getElementById("purchased-list");
const purchasedTitleEl = document.getElementById("purchased-title");
const emptyMessageEl = document.getElementById("empty-message");
const itemTemplate = document.getElementById("product-item-template");

const summaryPendingEl = document.getElementById("summary-pending");
const summaryPurchasedEl = document.getElementById("summary-purchased");
const summaryCountEl = document.getElementById("summary-count");
const summaryTotalEl = document.getElementById("summary-total");
const summarySpentEl = document.getElementById("summary-spent");

const filterButtons = document.querySelectorAll(".filter-btn");

const btnClearPurchased = document.getElementById("btn-clear-purchased");
const btnUncheckAll = document.getElementById("btn-uncheck-all");
const btnClearAll = document.getElementById("btn-clear-all");
const btnToggleMoreOptions = document.getElementById("btn-toggle-more-options");
const moreOptionsPanel = document.getElementById("more-options-panel");

/* ==========================================================================
   Utilidades
   ========================================================================== */

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatCurrency(value) {
  return currencyFormatter.format(value || 0);
}

function findProduct(id) {
  return products.find((p) => p.id === id);
}

function getEffectiveTheme() {
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function updateThemeToggleButton() {
  const effective = getEffectiveTheme();
  btnThemeToggle.innerHTML = effective === "dark" ? SVG_ICON_SUN : SVG_ICON_MOON;
  btnThemeToggle.setAttribute(
    "aria-label",
    effective === "dark" ? "Cambiar a modo día" : "Cambiar a modo noche"
  );

  const explicit = document.documentElement.getAttribute("data-theme") || "auto";
  themeOptionButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.themeChoice === explicit);
  });
}

function applyTheme(theme) {
  if (theme === "light" || theme === "dark") {
    document.documentElement.setAttribute("data-theme", theme);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  updateThemeToggleButton();
}

function setTheme(theme) {
  try {
    if (theme === "light" || theme === "dark") {
      localStorage.setItem(THEME_KEY, theme);
    } else {
      localStorage.removeItem(THEME_KEY);
    }
  } catch (error) {
    console.error("No se pudo guardar la preferencia de tema.", error);
  }
  applyTheme(theme);
  refreshBgColorInput();
  applyPalette(getSavedPaletteId());
  applyBackgroundImage();
}

function getDefaultBgColor() {
  return getEffectiveTheme() === "dark" ? DEFAULT_BG_DARK : DEFAULT_BG_LIGHT;
}

function applyBgColor(color) {
  if (color) {
    document.documentElement.style.setProperty("--color-page-bg", color);
  } else {
    document.documentElement.style.removeProperty("--color-page-bg");
  }
}

function refreshBgColorInput() {
  let saved = null;
  try {
    saved = localStorage.getItem(BG_COLOR_KEY);
  } catch (error) {
    console.error("No se pudo leer el color de fondo guardado.", error);
  }
  inputBgColor.value = saved || getDefaultBgColor();
}

function getSavedPaletteId() {
  try {
    return localStorage.getItem(PALETTE_KEY);
  } catch (error) {
    console.error("No se pudo leer la plantilla de color guardada.", error);
    return null;
  }
}

function getSavedCustomColor() {
  try {
    return localStorage.getItem(CUSTOM_COLOR_KEY);
  } catch (error) {
    console.error("No se pudo leer tu color personalizado.", error);
    return null;
  }
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixColors(hexA, hexB, weightA) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({
    r: a.r * weightA + b.r * (1 - weightA),
    g: a.g * weightA + b.g * (1 - weightA),
    b: a.b * weightA + b.b * (1 - weightA),
  });
}

// A partir de un único color elegido a mano, arma variantes de claro/oscuro
// razonables (oscurecida para el modo día, aclarada para el modo noche, y un
// fondo suave mezclado con blanco o con el fondo oscuro según corresponda).
function buildCustomPaletteVariant(hex) {
  return {
    light: {
      primary: hex,
      primaryDark: mixColors(hex, "#000000", 0.78),
      primarySoft: mixColors(hex, "#ffffff", 0.13),
    },
    dark: {
      primary: mixColors(hex, "#ffffff", 0.72),
      primaryDark: mixColors(hex, "#ffffff", 0.5),
      primarySoft: mixColors(hex, "#10140e", 0.18),
    },
  };
}

function getPaletteVariants(paletteId) {
  if (paletteId === "custom") {
    return buildCustomPaletteVariant(getSavedCustomColor() || COLOR_PALETTES[0].swatch);
  }
  return COLOR_PALETTES.find((p) => p.id === paletteId) || COLOR_PALETTES[0];
}

function applyColorVariant(variant) {
  document.documentElement.style.setProperty("--color-primary", variant.primary);
  document.documentElement.style.setProperty("--color-primary-dark", variant.primaryDark);
  document.documentElement.style.setProperty("--color-primary-soft", variant.primarySoft);
}

function applyPalette(paletteId) {
  const variants = getPaletteVariants(paletteId);
  applyColorVariant(getEffectiveTheme() === "dark" ? variants.dark : variants.light);
}

function renderPaletteRow() {
  const activeId = getSavedPaletteId() || COLOR_PALETTES[0].id;
  const customColor = getSavedCustomColor();
  paletteRow.innerHTML = "";

  COLOR_PALETTES.forEach((palette) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "palette-swatch";
    btn.style.background = palette.swatch;
    btn.title = palette.label;
    btn.setAttribute("aria-label", `Plantilla de color ${palette.label}`);
    btn.classList.toggle("active", palette.id === activeId);
    btn.addEventListener("click", () => {
      try {
        localStorage.setItem(PALETTE_KEY, palette.id);
      } catch (error) {
        console.error("No se pudo guardar la plantilla de color.", error);
      }
      applyPalette(palette.id);
      renderPaletteRow();
    });
    paletteRow.appendChild(btn);
  });

  const customWrap = document.createElement("div");
  customWrap.className = "palette-custom-wrap";

  const customBtn = document.createElement("button");
  customBtn.type = "button";
  customBtn.className = "palette-swatch palette-swatch-custom";
  customBtn.title = "Elegir tu color";
  customBtn.setAttribute("aria-label", "Elegir tu propio color");
  customBtn.classList.toggle("active", activeId === "custom");

  const customInput = document.createElement("input");
  customInput.type = "color";
  customInput.className = "palette-custom-input";
  customInput.setAttribute("aria-hidden", "true");
  customInput.tabIndex = -1;
  customInput.value = customColor || COLOR_PALETTES[0].swatch;

  customBtn.addEventListener("click", () => customInput.click());

  // Vista previa en vivo mientras se arrastra en el selector nativo, sin
  // guardar ni volver a armar la fila (eso rompería el selector abierto).
  customInput.addEventListener("input", () => {
    const variants = buildCustomPaletteVariant(customInput.value);
    applyColorVariant(getEffectiveTheme() === "dark" ? variants.dark : variants.light);
  });

  customInput.addEventListener("change", () => {
    const hex = customInput.value;
    try {
      localStorage.setItem(CUSTOM_COLOR_KEY, hex);
      localStorage.setItem(PALETTE_KEY, "custom");
    } catch (error) {
      console.error("No se pudo guardar tu color personalizado.", error);
    }
    applyPalette("custom");
    renderPaletteRow();
  });

  customWrap.appendChild(customBtn);
  customWrap.appendChild(customInput);
  paletteRow.appendChild(customWrap);
}

function getSavedBgImageChoice() {
  let choice = null;
  try {
    choice = localStorage.getItem(BG_IMAGE_CHOICE_KEY);
  } catch (error) {
    console.error("No se pudo leer la preferencia de imagen de fondo.", error);
  }
  return choice || "pattern";
}

function updateBgImageButtons(choice) {
  bgImageOptionButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.bgChoice === choice);
  });
  bgImageStatusEl.textContent =
    choice === "custom" ? "Estás usando una imagen propia como fondo." : "";
}

function applyBackgroundImage() {
  let choice = getSavedBgImageChoice();

  if (choice === "none") {
    document.body.style.backgroundImage = "none";
  } else if (choice === "custom") {
    let customImage = null;
    try {
      customImage = localStorage.getItem(BG_IMAGE_CUSTOM_KEY);
    } catch (error) {
      console.error("No se pudo leer la imagen de fondo guardada.", error);
    }
    if (customImage) {
      document.body.style.backgroundImage = `url("${customImage}")`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundPosition = "center";
    } else {
      choice = "pattern";
    }
  }

  if (choice === "pattern") {
    const pattern = getEffectiveTheme() === "dark" ? FOOD_PATTERN_DARK : FOOD_PATTERN_LIGHT;
    document.body.style.backgroundImage = `url("${pattern}")`;
    document.body.style.backgroundSize = "560px 560px";
    document.body.style.backgroundRepeat = "repeat";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundPosition = "center";
  }

  updateBgImageButtons(choice);
}

// Abre/cierra un selector de íconos dentro de `slotEl`, creándolo al vuelo.
// `triggerBtn` es el botón que lo abrió (para el estado aria-expanded) y
// `onSelect` recibe el ícono elegido cuando el usuario toca una opción.
function toggleIconPicker(triggerBtn, slotEl, onSelect) {
  const existing = slotEl.querySelector(".icon-picker");
  if (existing) {
    existing.remove();
    triggerBtn.setAttribute("aria-expanded", "false");
    return;
  }

  const picker = document.createElement("div");
  picker.className = "icon-picker";

  ALL_ICONS.forEach((icon) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "icon-option";
    btn.textContent = icon;
    btn.setAttribute("aria-label", `Usar ícono ${icon}`);
    btn.addEventListener("click", () => {
      onSelect(icon);
      picker.remove();
      triggerBtn.setAttribute("aria-expanded", "false");
    });
    picker.appendChild(btn);
  });

  slotEl.appendChild(picker);
  triggerBtn.setAttribute("aria-expanded", "true");
}

function closeIconPicker(slotEl, triggerBtn) {
  const existing = slotEl.querySelector(".icon-picker");
  if (existing) existing.remove();
  triggerBtn.setAttribute("aria-expanded", "false");
}

/* ==========================================================================
   Persistencia
   ========================================================================== */

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function saveCatalogVersion() {
  localStorage.setItem(CATALOG_VERSION_KEY, String(CATALOG_VERSION));
}

// Suma al catálogo guardado los productos nuevos que se hayan agregado al
// catálogo base (por nombre) y completa el precio de los que todavía están
// en $0, sin tocar productos que el usuario ya haya editado o priceado a
// mano. Corre una sola vez por versión de catálogo, así un producto borrado
// a propósito no vuelve a aparecer solo porque falta en la lista guardada.
function mergeNewCatalogProducts() {
  const storedVersion = Number(localStorage.getItem(CATALOG_VERSION_KEY)) || 0;
  if (storedVersion >= CATALOG_VERSION) return;

  const defaultsByName = new Map(
    DEFAULT_PRODUCTS.map((item) => [normalizeText(item.name), item])
  );

  const existingNames = new Set(products.map((p) => normalizeText(p.name)));
  const newProducts = DEFAULT_PRODUCTS.filter(
    (item) => !existingNames.has(normalizeText(item.name))
  );

  let changed = false;

  if (newProducts.length > 0) {
    products = products.concat(newProducts);
    changed = true;
  }

  products.forEach((product) => {
    if (product.price > 0) return;
    const match = defaultsByName.get(normalizeText(product.name));
    if (match && match.price > 0) {
      product.price = match.price;
      changed = true;
    }
  });

  if (changed) {
    saveToLocalStorage();
  }

  saveCatalogVersion();
}

function loadFromLocalStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw === null) {
    products = DEFAULT_PRODUCTS;
    saveToLocalStorage();
    saveCatalogVersion();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    products = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("No se pudo leer la lista guardada, se reinicia.", error);
    products = [];
  }

  mergeNewCatalogProducts();
}

/* ==========================================================================
   Operaciones sobre productos
   ========================================================================== */

function addProduct(name, quantity, price, icon) {
  const trimmedName = name.trim();
  if (!trimmedName) return;

  const safeQuantity = Math.max(1, Math.round(Number(quantity)) || 1);
  const safePrice = Math.max(0, Number(price) || 0);

  products.unshift({
    id: generateId(),
    name: trimmedName,
    quantity: safeQuantity,
    price: safePrice,
    purchased: false,
    category: getProductCategory(trimmedName),
    priority: false,
    icon: icon || getProductIcon(trimmedName),
  });

  saveToLocalStorage();
  renderProducts();
}

// Interpreta una línea de texto pegado como un producto: separa cantidad
// (prefijo "2 " / "2x ", o sufijo "x2") y precio (sufijo "$1.234,56") del
// resto, que queda como nombre. Devuelve null si la línea queda vacía.
function parsePastedLine(rawLine) {
  let line = rawLine.trim();
  if (!line) return null;

  line = line.replace(/^[-*•●▪‣◦]+\s*/, "").trim();
  line = line.replace(/^\d+[.)]\s+/, "").trim();
  if (!line) return null;

  let price = null;
  const priceMatch = line.match(/\$\s*([\d.,]+)\s*$/);
  if (priceMatch) {
    const rawPrice = priceMatch[1].replace(/\./g, "").replace(",", ".");
    const value = parseFloat(rawPrice);
    if (!isNaN(value)) price = value;
    line = line.slice(0, priceMatch.index).trim();
    line = line.replace(/[-–—|:]\s*$/, "").trim();
  }

  let quantity = 1;
  let match = line.match(/^(\d+)\s*[xX]\s+(.+)$/);
  if (match) {
    quantity = parseInt(match[1], 10);
    line = match[2].trim();
  } else {
    match = line.match(/^(\d+)\s+(.+)$/);
    if (match) {
      quantity = parseInt(match[1], 10);
      line = match[2].trim();
    } else {
      match = line.match(/^(.+?)\s*[xX]\s*(\d+)$/);
      if (match) {
        line = match[1].trim();
        quantity = parseInt(match[2], 10);
      }
    }
  }

  line = line.replace(/^[-–—|:]\s*/, "").replace(/[-–—|:]\s*$/, "").trim();
  if (!line) return null;

  return {
    name: line,
    quantity: Math.max(1, quantity || 1),
    price: price === null ? 0 : Math.max(0, price),
  };
}

// Agrega productos a partir de texto pegado (una línea por producto), sin
// duplicar los que ya están en la lista actual (por nombre, sin mayúsculas).
function addProductsFromText(text) {
  const existingNames = new Set(products.map((p) => p.name.trim().toLowerCase()));
  let added = 0;
  let skipped = 0;

  text.split(/\r?\n/).forEach((rawLine) => {
    const parsed = parsePastedLine(rawLine);
    if (!parsed) return;

    const key = parsed.name.toLowerCase();
    if (existingNames.has(key)) {
      skipped++;
      return;
    }
    existingNames.add(key);

    products.unshift({
      id: generateId(),
      name: parsed.name,
      quantity: parsed.quantity,
      price: parsed.price,
      purchased: false,
      category: getProductCategory(parsed.name),
      priority: false,
      icon: getProductIcon(parsed.name),
    });
    added++;
  });

  if (added > 0) {
    saveToLocalStorage();
    renderProducts();
  }

  return { added, skipped };
}

// Arma una representación en texto plano de la lista actual, pensada para
// copiar y pegar (y que `parsePastedLine` pueda volver a leerla).
function buildListText() {
  return products
    .map((p) => {
      let line = `${p.quantity} ${p.name}`;
      if (p.price > 0) line += ` - ${formatCurrency(p.price)}`;
      return line;
    })
    .join("\n");
}

/* ==========================================================================
   PDF (carga las librerías al vuelo, solo cuando hacen falta)
   ========================================================================== */

const JSPDF_URL = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/4.2.1/jspdf.umd.min.js";
const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const loadedScripts = {};
function loadScript(src) {
  if (!loadedScripts[src]) {
    loadedScripts[src] = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
      document.head.appendChild(script);
    });
  }
  return loadedScripts[src];
}

async function ensureJsPdfLoaded() {
  if (!window.jspdf) await loadScript(JSPDF_URL);
}

async function ensurePdfJsLoaded() {
  if (!window.pdfjsLib) {
    await loadScript(PDFJS_URL);
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
  }
}

function exportListAsPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  const rightEdge = doc.internal.pageSize.getWidth() - marginX;
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 50;

  function ensureSpace(lineHeight) {
    if (y + lineHeight > pageHeight - 50) {
      doc.addPage();
      y = 50;
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Neko Lista", marginX, y);
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generado el ${new Date().toLocaleDateString("es-AR")}`, marginX, y);
  y += 28;
  doc.setTextColor(20);

  function renderSection(title, items) {
    if (!items.length) return;
    ensureSpace(24);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(title, marginX, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    items.forEach((product) => {
      ensureSpace(18);
      doc.text(`${product.quantity} x ${product.name}`, marginX, y, { maxWidth: rightEdge - marginX - 100 });
      if (product.price > 0) {
        doc.text(formatCurrency(product.price * product.quantity), rightEdge, y, { align: "right" });
      }
      y += 16;
    });
    y += 10;
  }

  const pending = products.filter((product) => !product.purchased);
  const purchased = products.filter((product) => product.purchased);
  renderSection("Pendientes", pending);
  renderSection("Comprados", purchased);

  ensureSpace(60);
  doc.setDrawColor(200);
  doc.line(marginX, y, rightEdge, y);
  y += 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  const totalPending = pending.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const totalPurchased = purchased.reduce((sum, product) => sum + product.price * product.quantity, 0);
  doc.text(`Falta comprar: ${formatCurrency(totalPending)}`, marginX, y);
  y += 18;
  doc.text(`Ya compraste: ${formatCurrency(totalPurchased)}`, marginX, y);

  doc.save(`lista-de-compras-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// Líneas que no son productos: el título, la fecha y los subtotales que
// pone nuestro propio exportador. Se filtran antes de parsear, para que
// re-importar un PDF exportado desde acá no cree productos falsos.
const PDF_BOILERPLATE_PATTERNS = [
  /^neko lista$/i,
  /^mi lista de compras$/i,
  /^generado el /i,
  /^pendientes$/i,
  /^comprados$/i,
  /^falta comprar\b/i,
  /^ya compraste\b/i,
];

function stripPdfBoilerplate(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => !PDF_BOILERPLATE_PATTERNS.some((pattern) => pattern.test(line.trim())))
    .join("\n");
}

async function extractTextFromPdf(arrayBuffer) {
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    content.items.forEach((item) => {
      fullText += item.str + (item.hasEOL ? "\n" : " ");
    });
    fullText += "\n";
  }
  return fullText;
}

/* ==========================================================================
   Imagen: exportar la lista como foto, e importar leyendo una foto (OCR)
   ========================================================================== */

const TESSERACT_URL = "https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/7.0.0/tesseract.min.js";

async function ensureTesseractLoaded() {
  if (!window.Tesseract) await loadScript(TESSERACT_URL);
}

function pathRoundedRect(ctx, x, y, w, h, radii) {
  const r = typeof radii === "number" ? { tl: radii, tr: radii, br: radii, bl: radii } : radii;
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.arcTo(x + w, y, x + w, y + r.tr, r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.arcTo(x + w, y + h, x + w - r.br, y + h, r.br);
  ctx.lineTo(x + r.bl, y + h);
  ctx.arcTo(x, y + h, x, y + h - r.bl, r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.arcTo(x, y, x + r.tl, y, r.tl);
  ctx.closePath();
}

function truncateToWidth(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1 && ctx.measureText(`${truncated}…`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

async function exportListAsImage() {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;

  const rootStyles = getComputedStyle(document.documentElement);
  const primary = rootStyles.getPropertyValue("--color-primary").trim() || "#2f9e44";
  const primaryDark = rootStyles.getPropertyValue("--color-primary-dark").trim() || "#1f7a34";
  const textColor = "#21261f";
  const mutedColor = "#6f7d73";
  const borderColor = "#e6e2d5";
  const cardBg = "#ffffff";
  const pageBg = "#f5f3ee";

  const width = 800;
  const paddingX = 40;
  const headerHeight = 108;
  const rowHeight = 34;
  const sectionGap = 26;
  const outerMargin = 20;

  const pending = products.filter((product) => !product.purchased);
  const purchased = products.filter((product) => product.purchased);
  const totalPending = pending.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const totalPurchased = purchased.reduce((sum, product) => sum + product.price * product.quantity, 0);

  let contentHeight = 30;
  if (pending.length) contentHeight += 26 + pending.length * rowHeight + sectionGap;
  if (purchased.length) contentHeight += 26 + purchased.length * rowHeight + sectionGap;
  contentHeight += 76;

  const cardHeight = headerHeight + contentHeight;
  const totalHeight = cardHeight + outerMargin * 2;
  const cardX = outerMargin;
  const cardY = outerMargin;
  const cardW = width - outerMargin * 2;

  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = totalHeight * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  ctx.fillStyle = pageBg;
  ctx.fillRect(0, 0, width, totalHeight);

  pathRoundedRect(ctx, cardX, cardY, cardW, cardHeight, 20);
  ctx.fillStyle = cardBg;
  ctx.fill();

  pathRoundedRect(ctx, cardX, cardY, cardW, headerHeight, { tl: 20, tr: 20, br: 0, bl: 0 });
  const gradient = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + headerHeight);
  gradient.addColorStop(0, primary);
  gradient.addColorStop(1, primaryDark);
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 26px Outfit, sans-serif";
  ctx.fillText("🐱 Neko Lista", cardX + paddingX, cardY + 46);
  ctx.font = "500 14px Inter, sans-serif";
  ctx.globalAlpha = 0.9;
  const dateLabel = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
  ctx.fillText(dateLabel, cardX + paddingX, cardY + 74);
  ctx.globalAlpha = 1;

  let y = cardY + headerHeight + 34;
  const nameMaxWidth = cardW - paddingX * 2 - 150;

  function drawSection(title, items) {
    if (!items.length) return;
    ctx.fillStyle = mutedColor;
    ctx.font = "700 13px Outfit, sans-serif";
    ctx.fillText(title.toUpperCase(), cardX + paddingX, y);
    y += 24;

    items.forEach((product, index) => {
      ctx.fillStyle = textColor;
      ctx.font = "600 15px Inter, sans-serif";
      const icon = product.icon || getProductIcon(product.name);
      const label = `${icon}  ${product.quantity} x ${product.name}`;
      ctx.fillText(truncateToWidth(ctx, label, nameMaxWidth), cardX + paddingX, y);

      if (product.price > 0) {
        ctx.font = "700 15px Outfit, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(formatCurrency(product.price * product.quantity), cardX + cardW - paddingX, y);
        ctx.textAlign = "left";
      }

      if (index < items.length - 1) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cardX + paddingX, y + 13);
        ctx.lineTo(cardX + cardW - paddingX, y + 13);
        ctx.stroke();
      }

      y += rowHeight;
    });

    y += sectionGap;
  }

  drawSection("Pendientes", pending);
  drawSection("Comprados", purchased);

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardX + paddingX, y);
  ctx.lineTo(cardX + cardW - paddingX, y);
  ctx.stroke();
  y += 30;

  ctx.font = "700 15px Outfit, sans-serif";
  ctx.fillStyle = textColor;
  ctx.fillText("Falta comprar", cardX + paddingX, y);
  ctx.textAlign = "right";
  ctx.fillStyle = primaryDark;
  ctx.fillText(formatCurrency(totalPending), cardX + cardW - paddingX, y);
  ctx.textAlign = "left";
  y += 26;

  ctx.font = "500 13px Inter, sans-serif";
  ctx.fillStyle = mutedColor;
  ctx.fillText(`Ya compraste ${formatCurrency(totalPurchased)}`, cardX + paddingX, y);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("No se pudo generar la imagen."));
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `lista-de-compras-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}

async function extractTextFromImage(file, onProgress) {
  const worker = await window.Tesseract.createWorker("spa", 1, {
    logger: (info) => {
      if (onProgress && info.status === "recognizing text") {
        onProgress(Math.round(info.progress * 100));
      }
    },
  });
  try {
    const { data } = await worker.recognize(file);
    return data.text;
  } finally {
    await worker.terminate();
  }
}

function editProduct(id, changes) {
  const product = findProduct(id);
  if (!product) return;

  if (typeof changes.name === "string" && changes.name.trim()) {
    product.name = changes.name.trim();
  }
  if (changes.quantity !== undefined) {
    product.quantity = Math.max(1, Math.round(Number(changes.quantity)) || 1);
  }
  if (changes.price !== undefined) {
    product.price = Math.max(0, Number(changes.price) || 0);
  }
  if (typeof changes.category === "string" && changes.category) {
    product.category = changes.category;
  }
  if (typeof changes.priority === "boolean") {
    product.priority = changes.priority;
  }
  if (typeof changes.icon === "string" && changes.icon) {
    product.icon = changes.icon;
  }

  saveToLocalStorage();
  renderProducts();
}

function deleteProduct(id) {
  products = products.filter((p) => p.id !== id);
  saveToLocalStorage();
  renderProducts();
}

function togglePurchased(id) {
  const product = findProduct(id);
  if (!product) return;

  product.purchased = !product.purchased;
  saveToLocalStorage();
  renderProducts();
}

function clearPurchased() {
  const hasPurchased = products.some((p) => p.purchased);
  if (!hasPurchased) return;

  products = products.filter((p) => !p.purchased);
  saveToLocalStorage();
  renderProducts();
}

function uncheckAll() {
  products.forEach((p) => (p.purchased = false));
  saveToLocalStorage();
  renderProducts();
}

function clearAllProducts() {
  products = [];
  saveToLocalStorage();
  renderProducts();
}

/* ==========================================================================
   Filtros y cálculos
   ========================================================================== */

function filterProducts(list, filter) {
  switch (filter) {
    case "pending":
      return list.filter((p) => !p.purchased);
    case "purchased":
      return list.filter((p) => p.purchased);
    default:
      return list;
  }
}

function searchProducts(list, query) {
  const trimmed = query.trim();
  if (!trimmed) return list;
  const normalizedQuery = normalizeText(trimmed);
  return list.filter((p) => normalizeText(p.name).includes(normalizedQuery));
}

function sortByPriority(list) {
  return [...list].sort((a, b) => Number(b.priority) - Number(a.priority));
}

function filterByCategory(list, category) {
  if (!category) return list;
  return list.filter((p) => p.category === category);
}

function filterByPriorityOnly(list, onlyPriority) {
  if (!onlyPriority) return list;
  return list.filter((p) => p.priority);
}

function sortByPrice(list, order) {
  if (!order) return list;
  return [...list].sort((a, b) => (order === "desc" ? b.price - a.price : a.price - b.price));
}

function hasActiveExtraFilters() {
  return (
    Boolean(searchQuery.trim()) ||
    Boolean(filterCategory) ||
    filterPriorityOnly ||
    sortPriceOrder !== null
  );
}

function calculateTotals() {
  const pending = products.filter((p) => !p.purchased).length;
  const purchased = products.filter((p) => p.purchased).length;
  const count = products.length;
  const pendingTotal = products.reduce(
    (sum, p) => sum + (p.purchased ? 0 : p.quantity * p.price),
    0
  );
  const purchasedTotal = products.reduce(
    (sum, p) => sum + (p.purchased ? p.quantity * p.price : 0),
    0
  );

  return { pending, purchased, count, pendingTotal, purchasedTotal };
}

/* ==========================================================================
   Render
   ========================================================================== */

function renderSummary() {
  const { pending, purchased, count, pendingTotal, purchasedTotal } = calculateTotals();
  const newTotalText = formatCurrency(pendingTotal);

  if (summaryTotalEl.textContent && summaryTotalEl.textContent !== newTotalText) {
    summaryTotalEl.classList.remove("pulse");
    void summaryTotalEl.offsetWidth; // reinicia la animación si ya estaba corriendo
    summaryTotalEl.classList.add("pulse");
  }

  summaryPendingEl.textContent = pending;
  summaryPurchasedEl.textContent = purchased;
  summaryCountEl.textContent = count;
  summaryTotalEl.textContent = newTotalText;
  summarySpentEl.textContent = `Ya compraste ${formatCurrency(purchasedTotal)}`;
}

function createProductElement(product) {
  const fragment = itemTemplate.content.cloneNode(true);
  const li = fragment.querySelector(".product-item");

  li.dataset.id = product.id;
  li.classList.toggle("purchased", product.purchased);

  const checkbox = li.querySelector(".chk-purchased");
  checkbox.checked = product.purchased;

  li.querySelector(".product-icon").textContent = product.icon || getProductIcon(product.name);
  li.querySelector(".product-qty-display").textContent = product.quantity;
  li.querySelector(".priority-badge").textContent = product.priority ? "⭐" : "";
  li.querySelector(".product-name").textContent = product.name;
  li.querySelector(".product-total").textContent = formatCurrency(
    product.quantity * product.price
  );

  const editForm = li.querySelector(".product-edit");
  li.querySelector(".edit-name").value = product.name;
  li.querySelector(".edit-quantity").value = product.quantity;
  li.querySelector(".edit-price").value = product.price || "";
  li.querySelector(".edit-category").value = product.category;
  li.querySelector(".edit-priority").checked = product.priority;

  const editIconPreview = li.querySelector(".edit-icon-preview");
  const editIconPickerSlot = li.querySelector(".edit-icon-picker-slot");
  let editIcon = product.icon || getProductIcon(product.name);
  editIconPreview.textContent = editIcon;

  editIconPreview.addEventListener("click", () => {
    toggleIconPicker(editIconPreview, editIconPickerSlot, (icon) => {
      editIcon = icon;
      editIconPreview.textContent = icon;
    });
  });

  const editQuantityInput = li.querySelector(".edit-quantity");

  li.querySelector(".edit-qty-minus").addEventListener("click", () => {
    editQuantityInput.value = Math.max(1, (parseInt(editQuantityInput.value, 10) || 1) - 1);
  });
  li.querySelector(".edit-qty-plus").addEventListener("click", () => {
    editQuantityInput.value = (parseInt(editQuantityInput.value, 10) || 1) + 1;
  });

  // Eventos
  checkbox.addEventListener("change", () => togglePurchased(product.id));

  const openEdit = () => {
    const view = li.querySelector(".product-view");
    view.hidden = true;
    editForm.hidden = false;
    editIcon = product.icon || getProductIcon(product.name);
    editIconPreview.textContent = editIcon;
    li.querySelector(".edit-name").focus();
  };

  li.querySelector(".product-view").addEventListener("click", (event) => {
    if (event.target.closest(".checkbox-wrap")) return;
    openEdit();
  });

  li.querySelector(".btn-cancel-edit").addEventListener("click", () => {
    editForm.hidden = true;
    li.querySelector(".product-view").hidden = false;
    closeIconPicker(editIconPickerSlot, editIconPreview);
  });

  li.querySelector(".btn-delete").addEventListener("click", () => {
    if (confirm(`¿Eliminar "${product.name}" de la lista?`)) {
      deleteProduct(product.id);
    }
  });

  editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    editProduct(product.id, {
      name: li.querySelector(".edit-name").value,
      quantity: li.querySelector(".edit-quantity").value,
      price: li.querySelector(".edit-price").value,
      category: li.querySelector(".edit-category").value,
      priority: li.querySelector(".edit-priority").checked,
      icon: editIcon,
    });
  });

  return li;
}

function renderList(listEl, list) {
  listEl.innerHTML = "";
  const fragment = document.createDocumentFragment();
  list.forEach((product) => {
    fragment.appendChild(createProductElement(product));
  });
  listEl.appendChild(fragment);
}

function applyListFilters(list) {
  let result = searchProducts(list, searchQuery);
  result = filterByCategory(result, filterCategory);
  result = filterByPriorityOnly(result, filterPriorityOnly);
  return sortPriceOrder ? sortByPrice(result, sortPriceOrder) : sortByPriority(result);
}

function renderProducts() {
  const showPending = currentFilter !== "purchased";
  const showPurchased = true;

  const pendingItems = showPending
    ? applyListFilters(filterProducts(products, "pending"))
    : [];
  const purchasedItems = showPurchased
    ? applyListFilters(filterProducts(products, "purchased"))
    : [];

  renderList(pendingListEl, pendingItems);
  renderList(purchasedListEl, purchasedItems);

  pendingGroupEl.hidden = pendingItems.length === 0;
  purchasedGroupEl.hidden = purchasedItems.length === 0;

  const showPurchasedTitle = currentFilter === "all" && purchasedItems.length > 0;
  purchasedTitleEl.hidden = !showPurchasedTitle;
  purchasedTitleEl.textContent = `Comprados (${purchasedItems.length})`;

  const visibleCount = pendingItems.length + purchasedItems.length;
  emptyMessageEl.hidden = visibleCount > 0;
  emptyMessageEl.textContent = hasActiveExtraFilters()
    ? "No se encontraron productos con esos filtros."
    : "No hay productos para mostrar.";

  btnToggleFilters.classList.toggle(
    "active",
    Boolean(filterCategory) || filterPriorityOnly || sortPriceOrder !== null
  );

  renderSummary();
}

/* ==========================================================================
   Eventos generales
   ========================================================================== */

btnShowAddForm.addEventListener("click", () => {
  btnShowAddForm.hidden = true;
  addForm.hidden = false;
  inputName.focus();
});

btnCancelAdd.addEventListener("click", () => {
  addForm.hidden = true;
  btnShowAddForm.hidden = false;
  addForm.reset();
  inputQuantity.value = 1;
  manualIcon = null;
  inputIconPreview.textContent = DEFAULT_ICON;
  closeIconPicker(addIconPickerSlot, inputIconPreview);
});

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addProduct(inputName.value, inputQuantity.value, inputPrice.value, manualIcon);
  addForm.reset();
  inputQuantity.value = 1;
  manualIcon = null;
  inputIconPreview.textContent = DEFAULT_ICON;
  closeIconPicker(addIconPickerSlot, inputIconPreview);
  inputName.focus();
});

inputName.addEventListener("input", () => {
  if (manualIcon) return;
  inputIconPreview.textContent = inputName.value.trim()
    ? getProductIcon(inputName.value)
    : DEFAULT_ICON;
});

inputIconPreview.addEventListener("click", () => {
  toggleIconPicker(inputIconPreview, addIconPickerSlot, (icon) => {
    manualIcon = icon;
    inputIconPreview.textContent = icon;
  });
});

searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value;
  renderProducts();
});

btnThemeToggle.addEventListener("click", () => {
  setTheme(getEffectiveTheme() === "dark" ? "light" : "dark");
});

function openSettings() {
  settingsBackdrop.hidden = false;
  btnSettingsToggle.setAttribute("aria-expanded", "true");
}

function closeSettings() {
  settingsBackdrop.hidden = true;
  btnSettingsToggle.setAttribute("aria-expanded", "false");
}

btnSettingsToggle.addEventListener("click", () => {
  if (settingsBackdrop.hidden) {
    openSettings();
  } else {
    closeSettings();
  }
});

btnSettingsClose.addEventListener("click", closeSettings);

settingsBackdrop.addEventListener("click", (event) => {
  if (event.target === settingsBackdrop) closeSettings();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !settingsBackdrop.hidden) closeSettings();
});

function openSupportModal() {
  supportBackdrop.hidden = false;
}

function closeSupportModal() {
  supportBackdrop.hidden = true;
}

btnSupportProject.addEventListener("click", openSupportModal);
btnFooterSupport.addEventListener("click", openSupportModal);
btnSupportClose.addEventListener("click", closeSupportModal);

supportBackdrop.addEventListener("click", (event) => {
  if (event.target === supportBackdrop) closeSupportModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !supportBackdrop.hidden) closeSupportModal();
});

// El link de donación queda listo para cuando exista BRAND.donationUrl:
// mientras esté vacío, el botón se deshabilita en vez de apuntar a nada.
if (BRAND.donationUrl) {
  btnDonate.addEventListener("click", () => {
    window.open(BRAND.donationUrl, "_blank", "noopener");
  });
} else {
  btnDonate.disabled = true;
  donateStatus.textContent = "Todavía no está disponible, ¡pronto!";
}

// Igual que arriba: "Más herramientas" se activa solo cuando haya
// BRAND.websiteUrl; hasta entonces queda como texto simple, no clickeable.
if (BRAND.websiteUrl) {
  const websiteLink = document.createElement("a");
  websiteLink.href = BRAND.websiteUrl;
  websiteLink.target = "_blank";
  websiteLink.rel = "noopener";
  websiteLink.className = "app-footer-link";
  websiteLink.textContent = footerMoreTools.textContent;
  footerMoreTools.replaceWith(websiteLink);
}

ioTabButtons.forEach((tab) => {
  tab.addEventListener("click", () => {
    const isActive = tab.classList.contains("active");
    ioTabButtons.forEach((btn) => btn.classList.remove("active"));
    ioPanels.forEach((panel) => {
      panel.hidden = true;
    });
    if (!isActive) {
      tab.classList.add("active");
      document.querySelector(`.io-panel[data-io-panel="${tab.dataset.ioTab}"]`).hidden = false;
    }
  });
});

themeOptionButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setTheme(btn.dataset.themeChoice);
  });
});

btnExportData.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const today = new Date().toISOString().slice(0, 10);
  link.download = `lista-de-compras-${today}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

inputImportData.addEventListener("change", () => {
  const file = inputImportData.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    let parsed;
    try {
      parsed = JSON.parse(reader.result);
    } catch (error) {
      alert("El archivo no es un JSON válido.");
      inputImportData.value = "";
      return;
    }

    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item.name === "string")) {
      alert("El archivo no tiene el formato de una lista de compras.");
      inputImportData.value = "";
      return;
    }

    if (confirm(`¿Reemplazar tu lista actual por la del archivo (${parsed.length} productos)?`)) {
      products = parsed;
      saveToLocalStorage();
      mergeNewCatalogProducts();
      renderProducts();
    }
    inputImportData.value = "";
  };
  reader.readAsText(file);
});

btnCopyListText.addEventListener("click", async () => {
  const text = buildListText();
  pasteListTextarea.value = text;

  if (!text) {
    pasteListStatus.textContent = "Todavía no tenés productos para copiar.";
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    pasteListStatus.textContent = "Lista copiada al portapapeles.";
  } catch (error) {
    pasteListStatus.textContent = "Lista lista abajo: seleccioná el texto y copiala manualmente.";
  }
});

btnCreateFromText.addEventListener("click", () => {
  const text = pasteListTextarea.value;
  if (!text.trim()) {
    pasteListStatus.textContent = "Pegá o escribí al menos un producto primero.";
    return;
  }

  const { added, skipped } = addProductsFromText(text);
  if (added === 0 && skipped === 0) {
    pasteListStatus.textContent = "No se reconoció ningún producto en el texto.";
  } else {
    let message = `Se agregaron ${added} producto${added === 1 ? "" : "s"}.`;
    if (skipped > 0) {
      message += ` (${skipped} ya estaban en tu lista y se omitieron.)`;
    }
    pasteListStatus.textContent = message;
  }
});

btnExportPdf.addEventListener("click", async () => {
  if (!products.length) {
    pdfStatus.textContent = "Todavía no tenés productos para exportar.";
    return;
  }
  pdfStatus.textContent = "Generando PDF...";
  try {
    await ensureJsPdfLoaded();
    exportListAsPdf();
    pdfStatus.textContent = "PDF descargado.";
  } catch (error) {
    console.error("No se pudo generar el PDF.", error);
    pdfStatus.textContent = "No se pudo generar el PDF. Revisá tu conexión e intentá de nuevo.";
  }
});

inputImportPdf.addEventListener("change", async () => {
  const file = inputImportPdf.files[0];
  if (!file) return;

  pdfStatus.textContent = "Leyendo el PDF...";
  try {
    await ensurePdfJsLoaded();
    const arrayBuffer = await file.arrayBuffer();
    const text = await extractTextFromPdf(arrayBuffer);
    const { added, skipped } = addProductsFromText(stripPdfBoilerplate(text));
    if (added === 0 && skipped === 0) {
      pdfStatus.textContent = "No se reconoció ningún producto en el PDF.";
    } else {
      let message = `Se agregaron ${added} producto${added === 1 ? "" : "s"} desde el PDF.`;
      if (skipped > 0) message += ` (${skipped} ya estaban en tu lista.)`;
      pdfStatus.textContent = message;
    }
  } catch (error) {
    console.error("No se pudo leer el PDF.", error);
    pdfStatus.textContent = "No se pudo leer el PDF. Probá con otro archivo.";
  }
  inputImportPdf.value = "";
});

btnExportImage.addEventListener("click", async () => {
  if (!products.length) {
    imageStatus.textContent = "Todavía no tenés productos para exportar.";
    return;
  }
  imageStatus.textContent = "Generando imagen...";
  try {
    await exportListAsImage();
    imageStatus.textContent = "Imagen descargada.";
  } catch (error) {
    console.error("No se pudo generar la imagen.", error);
    imageStatus.textContent = "No se pudo generar la imagen. Intentá de nuevo.";
  }
});

inputImportImage.addEventListener("change", async () => {
  const file = inputImportImage.files[0];
  if (!file) return;

  imageStatus.textContent = "Cargando el lector de texto...";
  try {
    await ensureTesseractLoaded();
    imageStatus.textContent = "Leyendo la foto... 0%";
    const text = await extractTextFromImage(file, (percent) => {
      imageStatus.textContent = `Leyendo la foto... ${percent}%`;
    });
    const { added, skipped } = addProductsFromText(text);
    if (added === 0 && skipped === 0) {
      imageStatus.textContent = "No se reconoció ningún producto en la foto. Probá con una foto más clara.";
    } else {
      let message = `Se agregaron ${added} producto${added === 1 ? "" : "s"} desde la foto.`;
      if (skipped > 0) message += ` (${skipped} ya estaban en tu lista.)`;
      message += " Revisá la lista: el reconocimiento de texto puede equivocarse.";
      imageStatus.textContent = message;
    }
  } catch (error) {
    console.error("No se pudo leer la imagen.", error);
    imageStatus.textContent = "No se pudo leer la foto. Probá con otra imagen.";
  }
  inputImportImage.value = "";
});

inputBgColor.addEventListener("input", () => {
  const color = inputBgColor.value;
  applyBgColor(color);
  try {
    localStorage.setItem(BG_COLOR_KEY, color);
  } catch (error) {
    console.error("No se pudo guardar el color de fondo.", error);
  }

  // Una imagen de fondo es opaca y tapa el color por completo, así que un
  // color elegido a mano no se vería con la imagen puesta: la sacamos.
  if (getSavedBgImageChoice() !== "none") {
    try {
      localStorage.setItem(BG_IMAGE_CHOICE_KEY, "none");
    } catch (error) {
      console.error("No se pudo guardar la preferencia de imagen de fondo.", error);
    }
    applyBackgroundImage();
  }
});

btnResetBg.addEventListener("click", () => {
  applyBgColor(null);
  try {
    localStorage.removeItem(BG_COLOR_KEY);
  } catch (error) {
    console.error("No se pudo restablecer el color de fondo.", error);
  }
  refreshBgColorInput();
});

bgImageOptionButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const choice = btn.dataset.bgChoice;
    try {
      localStorage.setItem(BG_IMAGE_CHOICE_KEY, choice);
    } catch (error) {
      console.error("No se pudo guardar la preferencia de imagen de fondo.", error);
    }
    applyBackgroundImage();
  });
});

inputBgImage.addEventListener("change", () => {
  const file = inputBgImage.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Elegí un archivo de imagen.");
    inputBgImage.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 1600;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.75);

      try {
        localStorage.setItem(BG_IMAGE_CUSTOM_KEY, dataUrl);
        localStorage.setItem(BG_IMAGE_CHOICE_KEY, "custom");
      } catch (error) {
        console.error("No se pudo guardar la imagen de fondo.", error);
        alert("La imagen es muy pesada para guardarla. Probá con una más chica.");
        inputBgImage.value = "";
        return;
      }
      applyBackgroundImage();
      inputBgImage.value = "";
    };
    img.onerror = () => {
      alert("No se pudo cargar la imagen.");
      inputBgImage.value = "";
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

btnToggleFilters.addEventListener("click", () => {
  const isOpen = !filtersPanel.hidden;
  filtersPanel.hidden = isOpen;
  btnToggleFilters.setAttribute("aria-expanded", String(!isOpen));
});

filterCategorySelect.addEventListener("change", () => {
  filterCategory = filterCategorySelect.value;
  renderProducts();
});

filterPriorityCheckbox.addEventListener("change", () => {
  filterPriorityOnly = filterPriorityCheckbox.checked;
  renderProducts();
});

function updateSortPriceButton() {
  btnSortPrice.dataset.sort = sortPriceOrder || "none";
  btnSortPrice.classList.toggle("active", Boolean(sortPriceOrder));
  if (sortPriceOrder === "desc") {
    btnSortPrice.textContent = "Precio: mayor a menor ↓";
  } else if (sortPriceOrder === "asc") {
    btnSortPrice.textContent = "Precio: menor a mayor ↑";
  } else {
    btnSortPrice.textContent = "Ordenar por precio";
  }
}

btnSortPrice.addEventListener("click", () => {
  sortPriceOrder = sortPriceOrder === null ? "desc" : sortPriceOrder === "desc" ? "asc" : null;
  updateSortPriceButton();
  renderProducts();
});

btnClearFilters.addEventListener("click", () => {
  filterCategory = "";
  filterPriorityOnly = false;
  sortPriceOrder = null;
  filterCategorySelect.value = "";
  filterPriorityCheckbox.checked = false;
  updateSortPriceButton();
  renderProducts();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderProducts();
  });
});

btnClearPurchased.addEventListener("click", () => {
  const { purchased } = calculateTotals();
  if (purchased === 0) {
    alert("No hay productos comprados para eliminar.");
    return;
  }
  if (confirm("¿Eliminar todos los productos marcados como comprados?")) {
    clearPurchased();
  }
});

btnUncheckAll.addEventListener("click", () => {
  uncheckAll();
});

btnClearAll.addEventListener("click", () => {
  if (products.length === 0) return;
  if (confirm("¿Vaciar toda la lista de compras? Esta acción no se puede deshacer.")) {
    clearAllProducts();
  }
});

btnToggleMoreOptions.addEventListener("click", () => {
  const isOpen = !moreOptionsPanel.hidden;
  moreOptionsPanel.hidden = isOpen;
  btnToggleMoreOptions.setAttribute("aria-expanded", String(!isOpen));
});

/* ==========================================================================
   Inicio
   ========================================================================== */

function init() {
  updateThemeToggleButton();
  refreshBgColorInput();
  renderPaletteRow();
  applyPalette(getSavedPaletteId());
  applyBackgroundImage();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!document.documentElement.getAttribute("data-theme")) {
      updateThemeToggleButton();
      let savedBgOnChange = null;
      try {
        savedBgOnChange = localStorage.getItem(BG_COLOR_KEY);
      } catch (error) {
        console.error("No se pudo leer el color de fondo guardado.", error);
      }
      if (!savedBgOnChange) refreshBgColorInput();
      applyPalette(getSavedPaletteId());
      applyBackgroundImage();
    }
  });

  let savedBg = null;
  try {
    savedBg = localStorage.getItem(BG_COLOR_KEY);
  } catch (error) {
    console.error("No se pudo leer el color de fondo guardado.", error);
  }
  if (savedBg) applyBgColor(savedBg);

  loadFromLocalStorage();
  renderProducts();
}

init();
