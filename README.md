# Campus Snack Bar POS

A desktop friendly point of sale app for the IT 415 Campus Snack Bar practical exam.

## Current milestone: Stage 3 — validation and final improvements

The app supports the six hard-coded products, an in-memory cart, quantity controls, cash validation, change calculation, payment confirmation, a digital receipt, and a new transaction reset. Amounts are calculated in integer centavos.

## Run

Open `index.html` in a current desktop browser. No package installation, server, or build step is required.

## Files

- `index.html` — page structure and accessible controls
- `styles.css` — responsive desktop friendly layout and receipt styling
- `app.js` — hard-coded products, in-memory cart, payment flow, validation, and calculations

## Technology

Plain HTML, CSS, and JavaScript. No database, login, inventory system, payment gateway, or deployment setup is used.

## Manual checks

1. Open `index.html`; confirm the six listed products and prices appear.
2. Add a Classic Burger twice and Soda once; confirm quantities, subtotals, and total of ₱135.00.
3. Try submitting with a blank amount, letters (such as `abc`), a negative amount (such as `-1`), and insufficient cash (such as `100`). Confirm each shows a clear message and does not complete the sale.
4. Enter `150`; confirm payment is accepted, change is ₱15.00, and the receipt shows products, quantities, subtotals, total, amount paid, change, and a transaction reference.
5. Confirm product/cart controls and payment are locked after checkout. Select **Start new transaction**; confirm cart, payment, receipt, and reference clear and controls are available again.
6. Resize the browser to a narrow window and use Tab/Enter to check keyboard access to the controls.
