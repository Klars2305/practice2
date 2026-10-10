# Campus Snack Bar POS

A desktop-friendly point-of-sale app for the IT 415 Campus Snack Bar practical exam.

## Current milestone: Stage 6 — maintainability

This refactor preserves the existing products, prices, glass interface, payment flow, dialogs, receipt, and in-memory transaction behavior. It keeps the app dependency-free and suitable for opening directly in a browser.

## Run

Open `index.html` in a current desktop browser. No installation, server, or build step is required.

## Files

- `index.html` — semantic product list, payment controls, and accessible dialogs
- `styles.css` — consolidated design tokens, glass surfaces, responsive layout, and focus states
- `app.js` — product data, calculations, rendering, payment validation, and transaction actions

## Refactoring notes

- JavaScript is grouped into product data, DOM/state, reusable helpers, rendering, transaction actions, and event handlers.
- Product lookup uses an in-memory map; payment validation returns one consistent result object for valid and invalid amounts.
- Product cards are rendered once. Cart and receipt updates build their content in document fragments before replacing the current content.
- CSS rules and breakpoints are consolidated, with shared colors, surfaces, shadows, radii, and typography defined as design tokens. The glassmorphism and icon style are preserved.
- The product catalog exposes list semantics. Dialogs keep native keyboard behavior; error feedback marks invalid cash, and resetting a transaction moves focus back to the first product.

## Regression checks

A no-dependency Node harness was run against the app logic. It checked all six product names and prices, adding items, quantity changes, subtotals and totals, remove confirmation/cancellation, blank/non-numeric/negative/insufficient payment, payment review/cancellation, duplicate-payment prevention, receipt contents, completed-sale locking, and full transaction reset. All harness checks passed.

Native browser focus trapping and keyboard dismissal are provided by the `<dialog>` elements and their autofocus controls. They were not exercised in a live browser in this environment; use the manual checks below when opening the app locally.

## Manual usability checks

1. Open `index.html`; confirm the six products and prices are visible.
2. Add a Classic Burger twice and Soda once; confirm quantities, subtotals, and the ₱135.00 total.
3. Try blank, non-numeric (`abc`), negative (`-1`), and insufficient (`100`) cash. Check the messages and verify the cart remains unchanged.
4. Submit sufficient cash, review the payment confirmation, and accept it. Confirm the receipt shows items, quantities, subtotals, total, paid amount, change, and transaction reference.
5. Use Tab and Shift+Tab inside each modal; use Escape to cancel. Confirm focus stays in an open dialog, returns on dismissal, and canceled actions preserve the order.
6. Confirm removing an item updates totals. Confirm canceling removal preserves it.
7. Start a new transaction, cancel once, then confirm. Check cart, payment, receipt, and order reference clear and focus returns to the first product.

## Scope

Plain HTML, CSS, and JavaScript. Data stays in memory. There is no database, login, inventory system, payment gateway, or deployment setup.
