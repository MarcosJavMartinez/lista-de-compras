"use strict";

/* ==========================================================================
   Constantes y estado
   ========================================================================== */

const STORAGE_KEY = "listaCompras.productos";
const THEME_KEY = "listaCompras.theme";
const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

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
const settingsPanel = document.getElementById("settings-panel");
const themeOptionButtons = document.querySelectorAll(".theme-option");
const btnExportData = document.getElementById("btn-export-data");
const inputImportData = document.getElementById("input-import-data");

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
  btnThemeToggle.textContent = effective === "dark" ? "☀️" : "🌙";
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

btnSettingsToggle.addEventListener("click", () => {
  const isOpen = !settingsPanel.hidden;
  settingsPanel.hidden = isOpen;
  btnSettingsToggle.setAttribute("aria-expanded", String(!isOpen));
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
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!document.documentElement.getAttribute("data-theme")) {
      updateThemeToggleButton();
    }
  });

  loadFromLocalStorage();
  renderProducts();
}

init();
