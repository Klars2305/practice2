// The menu, cart, and completed transaction stay in memory for this browser session.
// Prices use integer centavos so calculations remain exact.
const products = [
  { id: "classic-burger", name: "Classic Burger", category: "BURGERS", price: 5500, icon: "burger", tone: "peach" },
  { id: "cheeseburger", name: "Cheeseburger", category: "BURGERS", price: 6500, icon: "cheeseburger", tone: "gold" },
  { id: "ham-sandwich", name: "Ham Sandwich", category: "SANDWICHES", price: 4000, icon: "sandwich", tone: "sage" },
  { id: "regular-fries", name: "French Fries (Regular)", category: "SIDES", price: 4500, icon: "fries", tone: "coral" },
  { id: "nachos", name: "Nachos", category: "SIDES", price: 5000, icon: "nachos", tone: "cream" },
  { id: "soda-can", name: "Soda (Can)", category: "DRINKS", price: 2500, icon: "soda", tone: "blue" },
];

// Local, Lucide-style SVGs keep familiar icons available without a network dependency.
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

const productGrid = document.querySelector("#product-grid");
const productCount = document.querySelector("#product-count");
const orderLines = document.querySelector("#order-lines");
const emptyOrder = document.querySelector("#empty-order");
const orderTotal = document.querySelector("#order-total");
const paymentForm = document.querySelector("#payment-form");
const cashAmount = document.querySelector("#cash-amount");
const payButton = document.querySelector("#pay-button");
const paymentMessage = document.querySelector("#payment-message");
const receipt = document.querySelector("#receipt");
const newTransactionButton = document.querySelector("#new-transaction");
const orderNumber = document.querySelector(".order-number strong");
const paymentConfirmModal = document.querySelector("#payment-confirm-modal");
const paymentConfirmDetails = document.querySelector("#payment-confirm-details");
const insufficientModal = document.querySelector("#insufficient-modal");
const insufficientDetails = document.querySelector("#insufficient-details");
const removeConfirmModal = document.querySelector("#remove-confirm-modal");
const removeConfirmDetails = document.querySelector("#remove-confirm-details");
const newTransactionModal = document.querySelector("#new-transaction-modal");
const receiptModal = document.querySelector("#receipt-modal");
document.querySelector(".welcome-copy").textContent = "Choose from today's snack bar favorites.";
document.querySelector(".cash-input-wrap > span").textContent = "\u20B1";
document.querySelector(".bag-icon").replaceChildren(createIcon("basket", 18));
document.querySelector(".empty-icon").replaceChildren(createIcon("cart", 23));
payButton.querySelector("span").replaceChildren(createIcon("arrow", 17));
let pendingRemoval = null;
let pendingPayment = null;
const cart = new Map();
let transactionCount = 0;
let completedTransaction = null;

function formatPesos(amountInCentavos) {
  return `\u20B1${(amountInCentavos / 100).toFixed(2)}`;
}

function renderProducts() {
  productCount.textContent = `${products.length} ITEMS`;
  for (const product of products) {
    const card = document.createElement("article");
    card.className = "product-card";
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
    addButton.disabled = Boolean(completedTransaction);
    const plus = createIcon("plus", 15);
    plus.classList.add("button-icon");
    addButton.append(plus, document.createTextNode(" Add"));
    bottom.append(price, addButton);
    details.append(category, name, bottom);
    card.append(visual, details);
    productGrid.append(card);
  }
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
  button.disabled = Boolean(completedTransaction);
  return button;
}

function getTotal() {
  let total = 0;
  for (const [productId, quantity] of cart) {
    const product = products.find((item) => item.id === productId);
    if (product) total += product.price * quantity;
  }
  return total;
}

function renderCart() {
  orderLines.replaceChildren();
  for (const [productId, quantity] of cart) {
    const product = products.find((item) => item.id === productId);
    if (!product) continue;
    const row = document.createElement("article");
    row.className = "cart-row";
    const top = document.createElement("div");
    top.className = "cart-row-top";
    const name = document.createElement("h3");
    name.className = "cart-product-name";
    name.textContent = product.name;
    const amount = document.createElement("strong");
    amount.className = "cart-subtotal";
    amount.textContent = formatPesos(product.price * quantity);
    top.append(name, amount);
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
    orderLines.append(row);
  }
  emptyOrder.hidden = cart.size > 0;
  orderLines.hidden = cart.size === 0;
  orderTotal.textContent = formatPesos(getTotal());
  cashAmount.disabled = cart.size === 0 || Boolean(completedTransaction);
  payButton.disabled = cart.size === 0 || Boolean(completedTransaction);
}

function clearPaymentMessage() {
  paymentMessage.textContent = "";
  paymentMessage.className = "payment-message";
}

function renderReceipt(transaction) {
  receipt.replaceChildren();
  const heading = document.createElement("h3");
  heading.textContent = "Payment confirmed";
  heading.className = "receipt-title";
  const reference = document.createElement("p");
  reference.className = "receipt-reference";
  reference.textContent = `Transaction reference: ${transaction.reference}`;
  const message = document.createElement("p");
  message.className = "receipt-confirmation";
  message.textContent = "Thank you! Your order is paid.";
  const lines = document.createElement("div");
  lines.className = "receipt-lines";
  for (const item of transaction.items) {
    const line = document.createElement("div");
    line.className = "receipt-line";
    const description = document.createElement("span");
    description.textContent = `${item.name} × ${item.quantity}`;
    const subtotal = document.createElement("strong");
    subtotal.textContent = formatPesos(item.subtotal);
    line.append(description, subtotal);
    lines.append(line);
  }
  const totals = document.createElement("div");
  totals.className = "receipt-totals";
  for (const [label, amount] of [["Total", transaction.total], ["Amount paid", transaction.paid], ["Change", transaction.change]]) {
    const line = document.createElement("div");
    line.className = "receipt-line";
    const term = document.createElement("span");
    term.textContent = label;
    const value = document.createElement("strong");
    value.textContent = formatPesos(amount);
    line.append(term, value);
    totals.append(line);
  }
  receipt.append(heading, message, reference, lines, totals);
  receiptModal.showModal();
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action='add']");
  if (!button || completedTransaction) return;
  const currentQuantity = cart.get(button.dataset.productId) || 0;
  cart.set(button.dataset.productId, currentQuantity + 1);
  cashAmount.value = "";
  clearPaymentMessage();
  renderCart();
});

orderLines.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || completedTransaction) return;
  const { action, productId } = button.dataset;
  const currentQuantity = cart.get(productId);
  if (!currentQuantity) return;
  if (action === "remove" || (action === "decrease" && currentQuantity === 1)) {
    const product = products.find((item) => item.id === productId);
    pendingRemoval = { productId, productName: product.name };
    removeConfirmDetails.textContent = `Remove ${product.name} from this order? Your other items will stay in the cart.`;
    removeConfirmModal.showModal();
    return;
  } else if (action === "decrease") cart.set(productId, currentQuantity - 1);
  else if (action === "increase") cart.set(productId, currentQuantity + 1);
  cashAmount.value = "";
  clearPaymentMessage();
  renderCart();
});

paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearPaymentMessage();
  if (completedTransaction) {
    paymentMessage.textContent = "This transaction is already complete. Start a new transaction to accept another payment.";
    paymentMessage.classList.add("error");
    return;
  }
  if (pendingPayment !== null) {
    paymentMessage.textContent = "A payment is awaiting confirmation. No second payment was started.";
    paymentMessage.classList.add("error");
    return;
  }
  if (cart.size === 0) {
    paymentMessage.textContent = "Add at least one item before accepting payment.";
    paymentMessage.classList.add("error");
    return;
  }
  const entered = cashAmount.value.trim();
  if (!entered) paymentMessage.textContent = "Enter the cash amount received.";
  else if (/^-/.test(entered)) paymentMessage.textContent = "Cash received cannot be negative.";
  else if (!/^\d+(\.\d{1,2})?$/.test(entered)) paymentMessage.textContent = "Enter a valid amount using numbers and up to two decimal places.";
  else {
    const paid = Math.round(Number(entered) * 100);
    if (!Number.isSafeInteger(paid)) paymentMessage.textContent = "Enter a valid cash amount.";
    else if (paid < 0) paymentMessage.textContent = "Cash received cannot be negative.";
    else if (paid < getTotal()) {
      insufficientDetails.textContent = `The order total is ${formatPesos(getTotal())}, but the cash entered is ${formatPesos(paid)}. The order is unchanged. Enter the correct amount and try again.`;
      insufficientModal.showModal();
      return;
    }
    else {
      pendingPayment = paid;
      paymentConfirmDetails.textContent = `Order total: ${formatPesos(getTotal())}. Cash received: ${formatPesos(paid)}. Change: ${formatPesos(paid - getTotal())}.`;
      paymentConfirmModal.showModal();
      return;
    }
  }
  paymentMessage.classList.add("error");
});

newTransactionButton.addEventListener("click", () => {
  newTransactionModal.showModal();
});

document.querySelector("#accept-payment").addEventListener("click", () => {
  // Guard against a repeated submission while a confirmation is already pending.
  if (completedTransaction || pendingPayment === null || cart.size === 0) return;
  const paid = pendingPayment;
  pendingPayment = null;
  paymentConfirmModal.close();
  transactionCount += 1;
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  completedTransaction = {
    reference: `SB-${datePart}-${String(transactionCount).padStart(3, "0")}`,
    items: [...cart].map(([productId, quantity]) => {
      const product = products.find((item) => item.id === productId);
      return { name: product.name, quantity, subtotal: product.price * quantity };
    }),
    total: getTotal(), paid, change: paid - getTotal(),
  };
  cashAmount.disabled = true;
  payButton.disabled = true;
  newTransactionButton.hidden = false;
  orderNumber.textContent = completedTransaction.reference;
  orderNumber.parentElement.setAttribute("aria-label", `Current order ${completedTransaction.reference}`);
  productGrid.querySelectorAll("button").forEach((button) => { button.disabled = true; });
  renderCart();
  renderReceipt(completedTransaction);
});

paymentConfirmModal.addEventListener("close", () => { pendingPayment = null; });

document.querySelector("#confirm-remove").addEventListener("click", () => {
  if (!pendingRemoval) return;
  cart.delete(pendingRemoval.productId);
  pendingRemoval = null;
  cashAmount.value = "";
  clearPaymentMessage();
  removeConfirmModal.close();
  renderCart();
});
removeConfirmModal.addEventListener("close", () => { pendingRemoval = null; });

document.querySelector("#close-receipt").addEventListener("click", () => receiptModal.close());
document.querySelector("#receipt-new-transaction").addEventListener("click", () => {
  newTransactionModal.showModal();
});
document.querySelector("#confirm-new-transaction").addEventListener("click", () => {
  cart.clear();
  completedTransaction = null;
  cashAmount.value = "";
  newTransactionButton.hidden = true;
  clearPaymentMessage();
  orderNumber.textContent = "New";
  orderNumber.parentElement.setAttribute("aria-label", "New order");
  productGrid.replaceChildren();
  renderProducts();
  renderCart();
  newTransactionModal.close();
  receipt.replaceChildren();
  if (receiptModal.open) receiptModal.close();
});

insufficientModal.addEventListener("close", () => {
  if (cart.size > 0 && !completedTransaction) cashAmount.focus();
});

renderProducts();
renderCart();
