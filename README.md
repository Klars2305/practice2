# Campus Snack Bar POS

A desktop-friendly point-of-sale app for the IT 415 Campus Snack Bar practical exam.

## Current milestone: Stage 4 — dialogs and usability improvements

The app uses native keyboard-accessible dialogs for payment review, insufficient payment, remove confirmation, the receipt, and new-transaction confirmation. Invalid input gives a clear message; cancelled dialogs preserve the current order. Cash remains calculated in integer centavos.

The interface uses a layered glass surface, a soft ambient background, a modern system typography stack, accessible focus states, and locally rendered SVG food and action icons. Icons and fonts do not require a network connection.

## Run

Open `index.html` in a current desktop browser. No installation, server, or build step is required.

## Files

- `index.html` — interface, payment controls, and accessible dialog markup
- `styles.css` — desktop-friendly layout, readable contrast, focus states, and dialog styling
- `app.js` — hard-coded menu, in-memory cart, validation, and transaction flow

## Manual usability checks

1. Add a burger and soda. Submit blank cash, letters (`abc`), a negative amount (`-1`), and insufficient cash (`10`). Check each message is understandable and the cart quantities and total remain unchanged.
2. Submit enough cash. In the payment review dialog, use Tab and Shift+Tab to move between buttons; press Escape or choose **Go back** and confirm no payment is recorded. Submit again and choose **Accept payment**; check the receipt totals and transaction reference.
3. In the receipt dialog, use Tab to reach **Close receipt** and **Start new transaction**. Close the dialog and verify the completed order remains on screen.
4. Start another transaction. Press Escape or choose **Keep current order** and check the completed receipt/order is preserved. Reopen and choose **Clear and start new**; verify the cart, payment, receipt, and order reference reset.
5. Add an item again and choose **Remove**. Press Escape or **Keep item** and confirm it remains. Repeat and confirm removal; check the total recalculates.
6. After payment, try submitting again. Confirm a second payment cannot be recorded and use the new-transaction flow to accept another payment.
7. Complete the modal flow using only the keyboard. Confirm focus stays in each open dialog, returns to the triggering control when dismissed, and visible focus indicators remain easy to see.

## Scope

Plain HTML, CSS, and JavaScript. Data stays in memory. There is no database, login, inventory system, payment gateway, or deployment setup.
