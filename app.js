// Campus Snack Bar POS
// Product prices and transaction amounts use integer centavos for exact totals.

// -----------------------------------------------------------------------------
// Product data and local icon paths
// -----------------------------------------------------------------------------
const products = [
  { id: "classic-burger", name: "Classic Burger", category: "BURGERS", price: 5500, icon: "burger", tone: "peach" },
  { id: "cheeseburger", name: "Cheeseburger", category: "BURGERS", price: 6500, icon: "cheeseburger", tone: "gold" },
  { id: "ham-sandwich", name: "Ham Sandwich", category: "SANDWICHES", price: 4000, icon: "sandwich", tone: "sage" },
  { id: "regular-fries", name: "French Fries (Regular)", category: "SIDES", price: 4500, icon: "fries", tone: "coral" },
  { id: "nachos", name: "Nachos", category: "SIDES", price: 5000, icon: "nachos", tone: "cream" },
  { id: "soda-can", name: "Soda (Can)", category: "DRINKS", price: 2500, icon: "soda", tone: "blue" },
];

const productById = new Map(products.map((product) => [product.id, product]));

// Inline Lucide-style SVG path data keeps icons available without network assets.
const iconShapes = {
  burger: '<path d="M4 11a8 6 0 0 1 16 0"/><path d="M3.5 12h17l-1 3h-15l-1-3Z"/><path d="M5 16h14l-1 4H6l-1-4Z"/><path d="M8 8h.01M12 6.8h.01M16 8h.01"/>',
  cheeseburger: '<path d="M4 11a8 6 0 0 1 16 0"/><path d="M3.5 12h17l-1 3h-15l-1-3Z"/><path d="m7 15 3 4 2-2 2 2 3-4"/><path d="M8 8h.01M12 6.8h.01M16 8h.01"/>',
  sandwich: '<path d="m4 8 8-4 8 4v2H4V8Z"/><path d="M4 12h16l-2 8H6l-2-8Z"/><path d="m7 12 2 3 2-2 2 2 2-3"/>',
  fries: '<path d="m6 10 2-7 2 7 2-8 2 8 2-6 2 6"/><path d="m5 11 2 10h10l2-10H5Z"/><path d="M8 15h8"/>',
  nachos: '<path d="m4 17 5-10 5 10H4Z"/><path d="m11 18 5-12 5 12h-10Z"/><path d="m8 15 2 2M15 14l2 2"/>',
  soda: '<path d="M8 4h8l1 17H7L8 4Z"/><path d="M9 4V2h5l2 3M8 9h8M9 17h6"/>',
  bag: '<path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  cart: '<circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L22 8H5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  basket: '<path d="m3 10 2 11h14l2-11H3Z"/><path d="m7 10 5-7 5 7M8 14v3m4-3v3m4-3v3"/>',
};

// -----------------------------------------------------------------------------
// DOM references and in-memory transaction state
// -----------------------------------------------------------------------------
const elements = {
  productGrid: document.querySelector("#product-grid"),
  productCount: document.querySelector("#product-count"),
  orderLines: document.querySelector("#order-lines"),
  emptyOrder: document.querySelector("#empty-order"),
  orderTotal: document.querySelector("#order-total"),
  paymentForm: document.querySelector("#payment-form"),
  cashAmount: document.querySelector("#cash-amount"),
  payButton: document.querySelector("#pay-button"),
  paymentMessage: document.querySelector("#payment-message"),
  receipt: document.querySelector("#receipt"),
  newTransactionButton: document.querySelector("#new-transaction"),
  orderNumber: document.querySelector(".order-number strong"),
  paymentConfirmModal: document.querySelector("#payment-confirm-modal"),
  paymentConfirmDetails: document.querySelector("#payment-confirm-details"),
  insufficientModal: document.querySelector("#insufficient-modal"),
  insufficientDetails: document.querySelector("#insufficient-details"),
  removeConfirmModal: document.querySelector("#remove-confirm-modal"),
  removeConfirmDetails: document.querySelector("#remove-confirm-details"),
  newTransactionModal: document.querySelector("#new-transaction-modal"),
  receiptModal: document.querySelector("#receipt-modal"),
  acceptPayment: document.querySelector("#accept-payment"),
  confirmRemove: document.querySelector("#confirm-remove"),
  closeReceipt: document.querySelector("#close-receipt"),
  receiptNewTransaction: document.querySelector("#receipt-new-transaction"),
  confirmNewTransaction: document.querySelector("#confirm-new-transaction"),
  welcomeCopy: document.querySelector(".welcome-copy"),
  cashCurrency: document.querySelector(".cash-input-wrap > span"),
  bagIcon: document.querySelector(".bag-icon"),
  emptyIcon: document.querySelector(".empty-icon"),
};

const cart = new Map();
const transactionState = {
  count: 0,
  completed: null,
  pendingPayment: null,
  pendingRemovalId: null,
};

// -----------------------------------------------------------------------------
// Reusable formatting, icon, and calculation helpers
// -----------------------------------------------------------------------------
function formatPesos(amountInCentavos) {
  return `\u20B1${(amountInCentavos / 100).toFixed(2)}`;
}

function createIcon(name, size = 20) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.8");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.innerHTML = iconShapes[name] || iconShapes.bag;
  return svg;
}

function getCartTotal() {
  let total = 0;
  for (const [productId, quantity] of cart) {
    const product = productById.get(productId);
    if (product) total += product.price * quantity;
  }
  return total;
}

function validatePayment(rawAmount) {
  const entered = rawAmount.trim();
  if (cart.size === 0) return { valid: false, type: "empty", message: "Add at least one item before accepting payment." };
  if (!entered) return { valid: false, type: "input", message: "Enter the cash amount received." };
  if (/^-/.test(entered)) return { valid: false, type: "input", message: "Cash received cannot be negative." };
  if (!/^\d+(\.\d{1,2})?$/.test(entered)) {
    return { valid: false, type: "input", message: "Enter a valid amount using numbers and up to two decimal places." };
  }

  const paid = Math.round(Number(entered) * 100);
  if (!Number.isSafeInteger(paid)) {
    return { valid: false, type: "input", message: "Enter a valid cash amount." };
  }

  const total = getCartTotal();
  if (paid < total) return { valid: false, type: "insufficient", paid, total };
  return { valid: true, paid, total };
}

// -----------------------------------------------------------------------------
// Rendering: product catalog, order summary, and digital receipt
// -----------------------------------------------------------------------------
function renderProductCatalog() {
  elements.productCount.textContent = `${products.length} ITEMS`;
  const fragment = document.createDocumentFragment();

  for (const product of products) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.setAttribute("role", "listitem");

    const visual = document.createElement("div");
    visual.className = `product-visual ${product.tone}`;
    visual.setAttribute("aria-hidden", "true");
    visual.append(createIcon(product.icon, 54));

    const details = document.createElement("div");
    details.className = "product-details";
    const category = document.createElement("p");
    category.className = "product-category";
    category.textContent = product.category;
    const name = document.createElement("h3");
    name.className = "product-name";
    name.textContent = product.name;

    const bottom = document.createElement("div");
    bottom.className = "product-bottom";
    const price = document.createElement("strong");
    price.className = "product-price";
    price.textContent = formatPesos(product.price);
    const addButton = document.createElement("button");
    addButton.className = "add-button";
    addButton.type = "button";
    addButton.dataset.action = "add";
    addButton.dataset.productId = product.id;
    addButton.setAttribute("aria-label", `Add ${product.name} to order`);
    addButton.append(createIcon("plus", 15), document.createTextNode(" Add"));

    bottom.append(price, addButton);
    details.append(category, name, bottom);
    card.append(visual, details);
    fragment.append(card);
  }

  elements.productGrid.replaceChildren(fragment);
}

function createCartButton(action, label, product) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = action === "remove" ? "remove-button" : "quantity-button";
  button.dataset.action = action;
  button.dataset.productId = product.id;
  button.setAttribute("aria-label", label);

  if (action === "remove") {
    button.append(createIcon("trash", 14), document.createTextNode(" Remove"));
  } else {
    button.append(createIcon(action === "increase" ? "plus" : "minus", 15));
  }
  return button;
}

function renderCart() {
  const fragment = document.createDocumentFragment();

  for (const [productId, quantity] of cart) {
    const product = productById.get(productId);
    if (!product) continue;

    const row = document.createElement("article");
    row.className = "cart-row";
    const top = document.createElement("div");
    top.className = "cart-row-top";
    const name = document.createElement("h3");
    name.className = "cart-product-name";
    name.textContent = product.name;
    const subtotal = document.createElement("strong");
    subtotal.className = "cart-subtotal";
    subtotal.textContent = formatPesos(product.price * quantity);
    top.append(name, subtotal);

    const bottom = document.createElement("div");
    bottom.className = "cart-row-bottom";
    const controls = document.createElement("div");
    controls.className = "quantity-controls";
    controls.append(createCartButton("decrease", `Decrease ${product.name} quantity`, product));
    const quantityLabel = document.createElement("span");
    quantityLabel.className = "quantity-value";
    quantityLabel.textContent = String(quantity);
    quantityLabel.setAttribute("aria-label", `Quantity ${quantity}`);
    controls.append(quantityLabel, createCartButton("increase", `Increase ${product.name} quantity`, product));
    bottom.append(controls, createCartButton("remove", `Remove ${product.name} from order`, product));
    row.append(top, bottom);
    fragment.append(row);
  }

  elements.orderLines.replaceChildren(fragment);
  const total = getCartTotal();
  elements.emptyOrder.hidden = cart.size > 0;
  elements.orderLines.hidden = cart.size === 0;
  elements.orderTotal.textContent = formatPesos(total);
  elements.cashAmount.disabled = cart.size === 0 || Boolean(transactionState.completed);
  elements.payButton.disabled = cart.size === 0 || Boolean(transactionState.completed);
}

function appendReceiptLine(parent, label, amount) {
  const line = document.createElement("div");
  line.className = "receipt-line";
  const description = document.createElement("span");
  description.textContent = label;
  const value = document.createElement("strong");
  value.textContent = formatPesos(amount);
  line.append(description, value);
  parent.append(line);
}

function renderReceipt(transaction) {
  const heading = document.createElement("h3");
  heading.className = "receipt-title";
  heading.textContent = "Payment confirmed";
  const confirmation = document.createElement("p");
  confirmation.className = "receipt-confirmation";
  confirmation.textContent = "Thank you! Your order is paid.";
  const reference = document.createElement("p");
  reference.className = "receipt-reference";
  reference.textContent = `Transaction reference: ${transaction.reference}`;

  const lines = document.createElement("div");
  lines.className = "receipt-lines";
  for (const item of transaction.items) {
    appendReceiptLine(lines, `${item.name} × ${item.quantity}`, item.subtotal);
  }

  const totals = document.createElement("div");
  totals.className = "receipt-totals";
  appendReceiptLine(totals, "Total", transaction.total);
  appendReceiptLine(totals, "Amount paid", transaction.paid);
  appendReceiptLine(totals, "Change", transaction.change);

  elements.receipt.replaceChildren(heading, confirmation, reference, lines, totals);
  elements.receiptModal.showModal();
}

// -----------------------------------------------------------------------------
// Transaction and payment actions
// -----------------------------------------------------------------------------
function clearPaymentMessage() {
  elements.paymentMessage.textContent = "";
  elements.paymentMessage.className = "payment-message";
  elements.cashAmount.setAttribute("aria-invalid", "false");
}

function setPaymentError(message) {
  elements.paymentMessage.textContent = message;
  elements.paymentMessage.className = "payment-message error";
  elements.cashAmount.setAttribute("aria-invalid", "true");
}

function setProductButtonsDisabled(disabled) {
  elements.productGrid.querySelectorAll("button[data-action='add']").forEach((button) => {
    button.disabled = disabled;
  });
}

function makeTransactionReference() {
  transactionState.count += 1;
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `SB-${date}-${String(transactionState.count).padStart(3, "0")}`;
}

function completePayment(paid) {
  if (transactionState.completed || cart.size === 0) return;

  const total = getCartTotal();
  transactionState.completed = {
    reference: makeTransactionReference(),
    items: [...cart].map(([productId, quantity]) => {
      const product = productById.get(productId);
      return { name: product.name, quantity, subtotal: product.price * quantity };
    }),
    total,
    paid,
    change: paid - total,
  };
  transactionState.pendingPayment = null;
  elements.paymentConfirmModal.close();
  elements.newTransactionButton.hidden = false;
  elements.orderNumber.textContent = transactionState.completed.reference;
  elements.orderNumber.parentElement.setAttribute("aria-label", `Current order ${transactionState.completed.reference}`);
  setProductButtonsDisabled(true);
  renderCart();
  renderReceipt(transactionState.completed);
}

function resetTransaction() {
  cart.clear();
  transactionState.completed = null;
  transactionState.pendingPayment = null;
  transactionState.pendingRemovalId = null;
  elements.cashAmount.value = "";
  elements.newTransactionButton.hidden = true;
  elements.orderNumber.textContent = "New";
  elements.orderNumber.parentElement.setAttribute("aria-label", "New order");
  clearPaymentMessage();
  elements.receipt.replaceChildren();
  elements.newTransactionModal.close();
  if (elements.receiptModal.open) elements.receiptModal.close();
  setProductButtonsDisabled(false);
  renderCart();
  elements.productGrid.querySelector("button[data-action='add']")?.focus();
}

// -----------------------------------------------------------------------------
// Event handlers
// -----------------------------------------------------------------------------
function handleProductClick(event) {
  const button = event.target.closest("button[data-action='add']");
  if (!button || transactionState.completed) return;

  const productId = button.dataset.productId;
  cart.set(productId, (cart.get(productId) || 0) + 1);
  elements.cashAmount.value = "";
  clearPaymentMessage();
  renderCart();
}

function handleCartClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button || transactionState.completed) return;

  const { action, productId } = button.dataset;
  const quantity = cart.get(productId);
  if (!quantity) return;

  if (action === "remove" || (action === "decrease" && quantity === 1)) {
    const product = productById.get(productId);
    transactionState.pendingRemovalId = productId;
    elements.removeConfirmDetails.textContent = `Remove ${product.name} from this order? Your other items will stay in the cart.`;
    elements.removeConfirmModal.showModal();
    return;
  }

  cart.set(productId, action === "decrease" ? quantity - 1 : quantity + 1);
  elements.cashAmount.value = "";
  clearPaymentMessage();
  renderCart();
}

function handlePaymentSubmit(event) {
  event.preventDefault();
  clearPaymentMessage();

  if (transactionState.completed) {
    setPaymentError("This transaction is already complete. Start a new transaction to accept another payment.");
    return;
  }
  if (transactionState.pendingPayment !== null) {
    setPaymentError("A payment is awaiting confirmation. No second payment was started.");
    return;
  }

  const result = validatePayment(elements.cashAmount.value);
  if (!result.valid) {
    if (result.type === "insufficient") {
      elements.insufficientDetails.textContent = `The order total is ${formatPesos(result.total)}, but the cash entered is ${formatPesos(result.paid)}. The order is unchanged. Enter the correct amount and try again.`;
      setPaymentError("Cash is below the order total. Update the amount and try again.");
      elements.insufficientModal.showModal();
    } else {
      setPaymentError(result.message);
    }
    return;
  }

  transactionState.pendingPayment = result.paid;
  elements.paymentConfirmDetails.textContent = `Order total: ${formatPesos(result.total)}. Cash received: ${formatPesos(result.paid)}. Change: ${formatPesos(result.paid - result.total)}.`;
  elements.paymentConfirmModal.showModal();
}

function confirmItemRemoval() {
  const productId = transactionState.pendingRemovalId;
  if (!productId || !cart.has(productId)) return;

  cart.delete(productId);
  transactionState.pendingRemovalId = null;
  elements.cashAmount.value = "";
  clearPaymentMessage();
  elements.removeConfirmModal.close();
  renderCart();
}

function initializeStaticIcons() {
  elements.welcomeCopy.textContent = "Choose from today's snack bar favorites.";
  elements.cashCurrency.textContent = "\u20B1";
  elements.bagIcon.replaceChildren(createIcon("basket", 18));
  elements.emptyIcon.replaceChildren(createIcon("cart", 23));
  elements.payButton.querySelector("span").replaceChildren(createIcon("arrow", 17));
}

function registerEventHandlers() {
  elements.productGrid.addEventListener("click", handleProductClick);
  elements.orderLines.addEventListener("click", handleCartClick);
  elements.paymentForm.addEventListener("submit", handlePaymentSubmit);
  elements.cashAmount.addEventListener("input", clearPaymentMessage);
  elements.acceptPayment.addEventListener("click", () => {
    if (transactionState.pendingPayment === null) return;
    completePayment(transactionState.pendingPayment);
  });
  elements.paymentConfirmModal.addEventListener("close", () => {
    transactionState.pendingPayment = null;
  });
  elements.confirmRemove.addEventListener("click", confirmItemRemoval);
  elements.removeConfirmModal.addEventListener("close", () => {
    transactionState.pendingRemovalId = null;
  });
  elements.closeReceipt.addEventListener("click", () => elements.receiptModal.close());
  elements.receiptNewTransaction.addEventListener("click", () => elements.newTransactionModal.showModal());
  elements.newTransactionButton.addEventListener("click", () => elements.newTransactionModal.showModal());
  elements.confirmNewTransaction.addEventListener("click", resetTransaction);
  elements.insufficientModal.addEventListener("close", () => {
    if (cart.size > 0 && !transactionState.completed) elements.cashAmount.focus();
  });
}

initializeStaticIcons();
registerEventHandlers();
renderProductCatalog();
renderCart();
