// Stage 2: the catalog and cart live in memory for this browser session.
// Prices and calculations use integer centavos to avoid floating-point totals.
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
const cart = new Map();

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
  return button;
}

function renderCart() {
  orderLines.replaceChildren();
  let total = 0;

  for (const [productId, quantity] of cart) {
    const product = products.find((item) => item.id === productId);
    if (!product) continue;

    const subtotal = product.price * quantity;
    total += subtotal;

    const row = document.createElement("article");
    row.className = "cart-row";

    const top = document.createElement("div");
    top.className = "cart-row-top";
    const name = document.createElement("h3");
    name.className = "cart-product-name";
    name.textContent = product.name;
    const amount = document.createElement("strong");
    amount.className = "cart-subtotal";
    amount.textContent = formatPesos(subtotal);
    top.append(name, amount);

    const bottom = document.createElement("div");
    bottom.className = "cart-row-bottom";
    const controls = document.createElement("div");
    controls.className = "quantity-controls";
    controls.append(
      createCartButton("decrease", `Decrease ${product.name} quantity`, product),
    );
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
  orderTotal.textContent = formatPesos(total);
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action='add']");
  if (!button) return;

  const currentQuantity = cart.get(button.dataset.productId) || 0;
  cart.set(button.dataset.productId, currentQuantity + 1);
  renderCart();
});

orderLines.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, productId } = button.dataset;
  const currentQuantity = cart.get(productId);
  if (!currentQuantity) return;

  if (action === "remove" || (action === "decrease" && currentQuantity === 1)) {
    cart.delete(productId);
  } else if (action === "decrease") {
    cart.set(productId, currentQuantity - 1);
  } else if (action === "increase") {
    cart.set(productId, currentQuantity + 1);
  }

  renderCart();
});

renderProducts();
renderCart();
