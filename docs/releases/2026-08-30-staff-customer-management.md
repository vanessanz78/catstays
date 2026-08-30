# Staff customer management recovery — 2026-08-30

## Issue and evidence

The live Staff Dashboard customer workspace could search and display tenant customer records, including cat names, email addresses, and mobile numbers. It could not add a customer, so staff had to leave the customer workspace and start a booking merely to create the record. The older standalone customer screen contained an add form with example personal details in its placeholders and was not part of the recovered Staff Dashboard shell.

## Recovery

- Add a clear **Add customer** action beside customer search.
- Keep customer filtering across customer name, cat name, email address, and mobile number.
- Open a full-width mobile sheet and centred desktop dialog inside the live Staff Dashboard.
- Capture customer name, email, optional mobile number, and optional first cat name without sample personal details.
- Save the customer to the signed-in cattery only and optionally add their first cat to the new record.
- Preserve the existing email, phone, and cat-profile display after the customer list refreshes.
- Provide an accessible close action, labelled fields, inline errors, and a disabled state while saving.

## Workflow and UAT

1. Run CatStays type check and production build locally and on the exact feature commit in Replit.
2. Review and merge the branch to GitHub main.
3. Pull the exact reviewed main commit into the visible Replit Shell, rebuild, and republish.
4. Verify the Deloraine customer list continues to load only its live customer records.
5. Verify search matches customer name, cat name, email address, and mobile number.
6. Verify Add customer opens, contains no example personal details, validates required fields, and closes from both Cancel and the labelled close control.
7. At 390 px, confirm the search, action, list, and add-customer sheet fit without document overflow.
8. Check live browser warnings and errors.

Automated UAT must not submit the add-customer form or change customer or cat data. Manual UAT can use a clearly identified test customer and remove it afterward if desired.
