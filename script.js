"use strict";

/* ==========================================================================
   Constantes y estado
   ========================================================================== */

const STORAGE_KEY = "listaCompras.productos";
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
  { keywords: ["pañuelos descartables"], icon: "🤧", category: "Limpieza" },
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
  { keywords: ["mayo de ajo"], icon: "🧄", category: "Almacén" },
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
  { name: "Maple de huevos", quantity: 1, price: 0 },
  { name: "Máquina de afeitar Gillette x3", quantity: 1, price: 5895 },
  { name: "Jabón Dove", quantity: 1, price: 2595 },
  { name: "Aceite Cañuelas 900 ml", quantity: 1, price: 4115 },
  { name: "Leche Tregar 1 L", quantity: 1, price: 2550 },
  { name: "Café La Virginia 100 g", quantity: 1, price: 5499 },
  { name: "Azúcar 1 kg", quantity: 1, price: 1475 },
  { name: "Manteca 200 g", quantity: 1, price: 3484.15 },
  { name: "Caldo de verduras x12", quantity: 1, price: 1879 },
  { name: "Rollos de cocina x3", quantity: 1, price: 2343.2 },
  { name: "Papel higiénico x4", quantity: 1, price: 3231.2 },
  { name: "Pasta dental Colgate", quantity: 1, price: 2493 },
  { name: "Pan lactal Bimbo integral", quantity: 1, price: 4293 },
  { name: "Puré de tomate", quantity: 1, price: 1110 },
  { name: "Atún", quantity: 2, price: 1750 },
  { name: "Lavandina", quantity: 1, price: 1279 },
  { name: "1 kg de cebolla", quantity: 1, price: 0 },
  { name: "2 cabezas de ajo", quantity: 1, price: 0 },
  { name: "1 morrón", quantity: 1, price: 0 },
  { name: "Ají molido", quantity: 1, price: 0 },
  { name: "Pinolux", quantity: 1, price: 0 },
  { name: "Queso para untar", quantity: 1, price: 0 },
  { name: "Crema para alergia", quantity: 1, price: 0 },
  { name: "Arroz", quantity: 1, price: 0 },
  { name: "Fideos x3", quantity: 1, price: 0 },
  { name: "Puré instantáneo", quantity: 1, price: 0 },
  { name: "Mister Músculo baño", quantity: 1, price: 0 },
  { name: "Mister Músculo cocina", quantity: 1, price: 0 },
  { name: "Té de hierbas digestivas", quantity: 1, price: 0 },
  { name: "Pan sin TACC", quantity: 1, price: 0 },
  { name: "Bolsón de verduras", quantity: 1, price: 0 },
  { name: "Jabón para ropa", quantity: 1, price: 0 },
  { name: "Mayo de ajo", quantity: 1, price: 0 },
  { name: "Queso untable Roquefort", quantity: 1, price: 0 },
  { name: "Bicarbonato", quantity: 1, price: 0 },
  { name: "Vinagre de alcohol", quantity: 1, price: 0 },
  { name: "Cabezal de mopa", quantity: 1, price: 0 },
  { name: "Preservativos", quantity: 1, price: 0 },
  { name: "Miel sólida", quantity: 1, price: 0 },
  { name: "Cinta adhesiva papel/clásica", quantity: 1, price: 0 },
  { name: "Bóxer", quantity: 1, price: 0 },
  { name: "Salchichas", quantity: 1, price: 0 },
  { name: "Mayoliva", quantity: 1, price: 0 },
  { name: "Aceite de oliva", quantity: 1, price: 0 },
  { name: "Jengibre", quantity: 1, price: 0 },
  { name: "Talco", quantity: 1, price: 0 },
  { name: "Detergente", quantity: 1, price: 0 },
  { name: "Trapo de piso", quantity: 1, price: 0 },
  { name: "Pañuelos descartables", quantity: 1, price: 0 },
  { name: "Sal fina", quantity: 1, price: 0 },
  { name: "Birulana", quantity: 1, price: 0 },
  { name: "Capuchino", quantity: 1, price: 0 },
  { name: "Blen original", quantity: 1, price: 0 },
  { name: "Vitamina C", quantity: 3, price: 0 },
  { name: "Escarbadientes", quantity: 1, price: 0 },
  { name: "Crema de afeitar", quantity: 1, price: 0 },
  { name: "Esponja", quantity: 1, price: 0 },
  { name: "Desodorante spray", quantity: 1, price: 0 },
  { name: "Ala para lavar ropa", quantity: 1, price: 0 },
  { name: "Miel líquida", quantity: 1, price: 0 },
  { name: "Cepillo para zapatos", quantity: 1, price: 0 },
  { name: "Enjuague dental", quantity: 1, price: 0 },
  { name: "Hilo dental", quantity: 1, price: 0 },
  { name: "Limón", quantity: 1, price: 0 },
  { name: "Té de manzanilla", quantity: 1, price: 0 },
  { name: "Plumero", quantity: 1, price: 0 },
  { name: "Perfume para ropa", quantity: 1, price: 0 },
].map((item) => ({
  id: generateId(),
  name: item.name,
  quantity: item.quantity,
  price: item.price,
  purchased: false,
  category: getProductCategory(item.name),
  priority: false,
}));

const CATALOG_VERSION = 2;
const CATALOG_VERSION_KEY = "listaCompras.catalogVersion";

let products = [];
let currentFilter = "all";
let searchQuery = "";

/* ==========================================================================
   Referencias del DOM
   ========================================================================== */

const addForm = document.getElementById("add-form");
const inputName = document.getElementById("input-name");
const inputQuantity = document.getElementById("input-quantity");
const inputPrice = document.getElementById("input-price");
const inputIconPreview = document.getElementById("input-icon-preview");

const searchInput = document.getElementById("search-input");

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

const filterButtons = document.querySelectorAll(".filter-btn");

const btnClearPurchased = document.getElementById("btn-clear-purchased");
const btnUncheckAll = document.getElementById("btn-uncheck-all");
const btnClearAll = document.getElementById("btn-clear-all");

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
// catálogo base (por nombre), sin tocar ni duplicar lo que el usuario ya tiene.
// Corre una sola vez por versión de catálogo, así un producto borrado a
// propósito no vuelve a aparecer solo porque falta en la lista guardada.
function mergeNewCatalogProducts() {
  const storedVersion = Number(localStorage.getItem(CATALOG_VERSION_KEY)) || 0;
  if (storedVersion >= CATALOG_VERSION) return;

  const existingNames = new Set(products.map((p) => normalizeText(p.name)));
  const newProducts = DEFAULT_PRODUCTS.filter(
    (item) => !existingNames.has(normalizeText(item.name))
  );

  if (newProducts.length > 0) {
    products = products.concat(newProducts);
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

function addProduct(name, quantity, price) {
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

function updateQuantity(id, delta) {
  const product = findProduct(id);
  if (!product) return;

  product.quantity = Math.max(1, product.quantity + delta);
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

function calculateTotals() {
  const pending = products.filter((p) => !p.purchased).length;
  const purchased = products.filter((p) => p.purchased).length;
  const count = products.length;
  const total = products.reduce((sum, p) => sum + p.quantity * p.price, 0);

  return { pending, purchased, count, total };
}

/* ==========================================================================
   Render
   ========================================================================== */

function renderSummary() {
  const { pending, purchased, count, total } = calculateTotals();

  summaryPendingEl.textContent = pending;
  summaryPurchasedEl.textContent = purchased;
  summaryCountEl.textContent = count;
  summaryTotalEl.textContent = formatCurrency(total);
}

function createProductElement(product) {
  const fragment = itemTemplate.content.cloneNode(true);
  const li = fragment.querySelector(".product-item");

  li.dataset.id = product.id;
  li.classList.toggle("purchased", product.purchased);

  const checkbox = li.querySelector(".chk-purchased");
  checkbox.checked = product.purchased;

  li.querySelector(".product-icon").textContent = getProductIcon(product.name);
  li.querySelector(".priority-badge").textContent = product.priority ? "⭐" : "";
  li.querySelector(".product-name").textContent = product.name;
  li.querySelector(".qty-value").textContent = product.quantity;

  const editForm = li.querySelector(".product-edit");
  li.querySelector(".edit-name").value = product.name;
  li.querySelector(".edit-quantity").value = product.quantity;
  li.querySelector(".edit-price").value = product.price || "";
  li.querySelector(".edit-category").value = product.category;
  li.querySelector(".edit-priority").checked = product.priority;

  // Eventos
  checkbox.addEventListener("change", () => togglePurchased(product.id));

  li.querySelector(".qty-minus").addEventListener("click", () =>
    updateQuantity(product.id, -1)
  );
  li.querySelector(".qty-plus").addEventListener("click", () =>
    updateQuantity(product.id, 1)
  );

  li.querySelector(".btn-edit").addEventListener("click", () => {
    const view = li.querySelector(".product-view");
    view.hidden = true;
    editForm.hidden = false;
    li.querySelector(".edit-name").focus();
  });

  li.querySelector(".btn-cancel-edit").addEventListener("click", () => {
    editForm.hidden = true;
    li.querySelector(".product-view").hidden = false;
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

function renderProducts() {
  const showPending = currentFilter !== "purchased";
  const showPurchased = currentFilter !== "pending";

  const pendingItems = showPending
    ? sortByPriority(searchProducts(filterProducts(products, "pending"), searchQuery))
    : [];
  const purchasedItems = showPurchased
    ? sortByPriority(searchProducts(filterProducts(products, "purchased"), searchQuery))
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
  emptyMessageEl.textContent = searchQuery.trim()
    ? `No se encontraron productos para "${searchQuery.trim()}".`
    : "No hay productos para mostrar.";

  renderSummary();
}

/* ==========================================================================
   Eventos generales
   ========================================================================== */

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addProduct(inputName.value, inputQuantity.value, inputPrice.value);
  addForm.reset();
  inputQuantity.value = 1;
  inputIconPreview.textContent = DEFAULT_ICON;
  inputName.focus();
});

inputName.addEventListener("input", () => {
  inputIconPreview.textContent = inputName.value.trim()
    ? getProductIcon(inputName.value)
    : DEFAULT_ICON;
});

searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value;
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

/* ==========================================================================
   Inicio
   ========================================================================== */

function init() {
  loadFromLocalStorage();
  renderProducts();
}

init();
