// The menu, cart, and completed transaction stay in memory for this browser session.
// Prices use integer centavos so calculations remain exact.
const products = [
  { id: "classic-burger", name: "Classic Burger", category: "BURGERS", price: 5500, icon: "\u{1F354}", tone: "peach" },
  { id: "cheeseburger", name: "Cheeseburger", category: "BURGERS", price: 6500, icon: "\u{1F354}", tone: "gold" },
  { id: "ham-sandwich", name: "Ham Sandwich", category: "SANDWICHES", price: 4000, icon: "\u{1F96A}", tone: "sage" },
  { id: "regular-fries", name: "French Fries (Regular)", category: "SIDES", price: 4500, icon: "\u{1F35F}", tone: "coral" },
  { id: "nachos", name: "Nachos", category: "SIDES", price: 5000, icon: "\u{1F9C0}", tone: "cream" },
  { id: "soda-can", name: "Soda (Can)", category: "DRINKS", price: 2500, icon: "\u{1F964}", tone: "blue" },
];

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
    visual.textContent = product.icon;
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
    const plus = document.createElement("span");
    plus.setAttribute("aria-hidden", "true");
    plus.textContent = "+";
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
  button.textContent = action === "increase" ? "+" : action === "decrease" ? "\u2212" : "Remove";
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
  receipt.hidden = false;
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
  if (action === "remove" || (action === "decrease" && currentQuantity === 1)) cart.delete(productId);
  else if (action === "decrease") cart.set(productId, currentQuantity - 1);
  else if (action === "increase") cart.set(productId, currentQuantity + 1);
  cashAmount.value = "";
  clearPaymentMessage();
  renderCart();
});

paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearPaymentMessage();
  if (cart.size === 0) {
    paymentMessage.textContent = "Add at least one item before accepting payment.";
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
    else if (paid < getTotal()) paymentMessage.textContent = `Payment is insufficient. The total is ${formatPesos(getTotal())}.`;
    else {
      transactionCount += 1;
      const now = new Date();
      const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      completedTransaction = {
        reference: `SB-${datePart}-${String(transactionCount).padStart(3, "0")}`,
        items: [...cart].map(([productId, quantity]) => {
          const product = products.find((item) => item.id === productId);
          return { name: product.name, quantity, subtotal: product.price * quantity };
        }),
        total: getTotal(),
        paid,
        change: paid - getTotal(),
      };
      paymentMessage.textContent = "Payment accepted.";
      paymentMessage.classList.add("success");
      cashAmount.disabled = true;
      payButton.disabled = true;
      newTransactionButton.hidden = false;
      orderNumber.textContent = completedTransaction.reference;
      orderNumber.parentElement.setAttribute("aria-label", `Current order ${completedTransaction.reference}`);
      productGrid.querySelectorAll("button").forEach((button) => { button.disabled = true; });
      renderCart();
      renderReceipt(completedTransaction);
      return;
    }
  }
  paymentMessage.classList.add("error");
});

newTransactionButton.addEventListener("click", () => {
  cart.clear();
  completedTransaction = null;
  cashAmount.value = "";
  receipt.replaceChildren();
  receipt.hidden = true;
  newTransactionButton.hidden = true;
  clearPaymentMessage();
  orderNumber.textContent = "New";
  orderNumber.parentElement.setAttribute("aria-label", "New order");
  productGrid.replaceChildren();
  renderProducts();
  renderCart();
});

renderProducts();
renderCart();
