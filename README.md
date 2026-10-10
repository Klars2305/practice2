# Campus Snack Bar POS

A small desktop-friendly point-of-sale app for the IT 415 Campus Snack Bar scenario.

## Current milestone: Stage 2 — ordering and calculations

The menu includes six hard-coded products and prices. Add buttons update an in-memory cart; quantity controls change or remove a line, and each line subtotal and order total recalculate after every change. Decreasing a line from quantity one removes it. Cash payment, payment validation, receipts, and transaction reset are planned for the next stage.

## Run

Open `index.html` in a current desktop browser. No package installation or server is required.

## Files

- `index.html` — page structure and accessible controls
- `styles.css` — responsive desktop-friendly layout and visual styling
- `app.js` — hard-coded product catalog, in-memory cart, rendering, and centavo-based calculations

## Technology

This project uses plain HTML, CSS, and JavaScript, as specified for this milestone. It has no package installation or build step.

## Next stage

Validation and final improvements: validate cash, calculate change, show confirmation and a receipt, support a new transaction, then review and document the finished app.

## Manual check for Stage 2

1. Open `index.html` in a desktop browser.
2. Add Classic Burger twice; confirm quantity is 2, subtotal is ₱110.00, and total is ₱110.00.
3. Add Fries and Soda; confirm their subtotals and the total of ₱180.00.
4. Increase and decrease a line; confirm quantity, subtotal, and total update each time.
5. Decrease any one-quantity line once; confirm the line is removed. Use Remove on another line and confirm the total updates.
6. Remove all lines; confirm the empty-cart message returns and total is ₱0.00.
7. Resize to a narrower window and tab through menu/cart controls. Cash checkout remains disabled until the next stage.
