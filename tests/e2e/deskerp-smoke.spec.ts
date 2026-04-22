import { expect, Locator, Page, test } from '@playwright/test';

async function fillNumberInput(page: Page, selector: string, value: string) {
    const input = page.locator(selector);
    await input.click();
    await input.fill('');
    await input.fill(value);
}

async function selectOption(page: Page, locator: Locator, optionText: string) {
    const trigger = locator.locator('.ant-select-selector');

    if (await trigger.count()) {
        await trigger.click();
    } else {
        await locator.click();
    }

    await page.locator('.ant-select-dropdown').last().waitFor({ state: 'visible', timeout: 10000 });
    await page
        .getByRole('option', { name: optionText, exact: true })
        .click({ timeout: 2000 })
        .catch(async () => {
            await page.locator('.ant-select-item-option').filter({ hasText: optionText }).first().click({ timeout: 10000 });
        });
}

async function selectRemoteOption(page: Page, testId: string, search: string, optionText: string) {
    const select = page.getByTestId(testId);
    const trigger = select.locator('.ant-select-selector');

    if (await trigger.count()) {
        await trigger.click();
    } else {
        await select.click();
    }

    await page.locator('.ant-select-dropdown').last().waitFor({ state: 'visible', timeout: 10000 });

    const searchInput = select.locator('input');
    if (await searchInput.count()) {
        await searchInput.last().fill(search);
    } else {
        await page.locator('.ant-select-dropdown input').last().fill(search);
    }

    await page
        .getByRole('option', { name: optionText, exact: true })
        .click({ timeout: 4000 })
        .catch(async () => {
            await page.locator('.ant-select-item-option').filter({ hasText: optionText }).first().click({ timeout: 10000 });
        });
}

test('smoke checks invoicing, payments, inventory, settings, and exports', async ({ page }) => {
    test.setTimeout(120000);

    const unique = `${Date.now()}`;
    const customerName = `PW Customer ${unique}`;
    const itemName = `PW Item ${unique}`;
    const fiscalYearLabel = '2082/83';

    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@deskerp.local');
    await page.getByLabel('Password').fill('deskerp123');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('app-shell-title')).toHaveText('Dashboard');

    await page.keyboard.press('Alt+s');
    await expect(page).toHaveURL(/\/settings$/);

    await page.getByTestId('settings-fiscal-year-label').fill(fiscalYearLabel);
    const bsSwitch = page.getByTestId('settings-bs-switch');
    if ((await bsSwitch.getAttribute('aria-checked')) !== 'true') {
        await bsSwitch.click();
    }
    await page.getByTestId('settings-save').click();
    await expect(page.getByText('BS Display')).toBeVisible();

    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await page.keyboard.press('Alt+n');
    await expect(page).toHaveURL(/\/invoices\/create$/);

    await page.getByTestId('invoice-add-customer').click();
    const customerResponsePromise = page.waitForResponse((response) => response.url().endsWith('/customers') && response.request().method() === 'POST' && response.status() === 200);
    await page.getByTestId('quick-customer-name').fill(customerName);
    await page.getByRole('button', { name: 'Save Customer' }).click();
    const customer = await (await customerResponsePromise).json();
    await selectRemoteOption(page, 'invoice-customer-select', customerName, customerName);

    await page.getByTestId('invoice-add-item').click();
    const itemResponsePromise = page.waitForResponse((response) => response.url().endsWith('/items') && response.request().method() === 'POST' && response.status() === 200);
    await page.getByTestId('quick-item-name').fill(itemName);
    await selectOption(page, page.getByTestId('quick-item-unit'), 'Piece');
    await fillNumberInput(page, '#quick-item-base-price', '80');
    await fillNumberInput(page, '#quick-item-selling-price', '100');
    await fillNumberInput(page, '#quick-item-tax-rate', '13');
    await fillNumberInput(page, '#quick-item-opening-stock', '10');
    await page.getByRole('button', { name: 'Save Item' }).click();
    const item = await (await itemResponsePromise).json();
    await selectRemoteOption(page, 'invoice-line-item-0', itemName, itemName);

    const csrfToken = await page.locator('meta[name="csrf-token"]').getAttribute('content');
    const invoiceCreateResponse = await page.context().request.post('/invoices', {
        headers: {
            'X-CSRF-TOKEN': csrfToken ?? '',
            Accept: 'text/html,application/xhtml+xml',
        },
        form: {
            customer_id: String(customer.id),
            issue_date: new Date().toISOString().slice(0, 10),
            due_date: '',
            status: 'final',
            reference_number: '',
            notes: '',
            'lines[0][item_id]': String(item.id),
            'lines[0][description]': itemName,
            'lines[0][unit_name]': 'PCS',
            'lines[0][quantity]': '1',
            'lines[0][rate]': '100',
            'lines[0][discount_percent]': '0',
            'lines[0][tax_percent]': '13',
        },
    });
    expect(invoiceCreateResponse.ok()).toBeTruthy();

    const createdInvoiceId = invoiceCreateResponse.url().match(/\/invoices\/(\d+)$/)?.[1];
    expect(createdInvoiceId).toBeTruthy();
    await page.goto(`/invoices/${createdInvoiceId}`);
    await expect(page.getByTestId('app-shell-title')).toContainText('INV-2082/83-00001');
    await expect(page.getByTestId('invoice-total')).toHaveText('113.00');
    await expect(page.getByTestId('invoice-paid-total')).toHaveText('0.00');
    await expect(page.getByTestId('invoice-balance-due')).toHaveText('113.00');
    await expect(page.getByTestId('invoice-payment-status')).toContainText('unpaid');

    const invoiceId = page.url().match(/\/invoices\/(\d+)$/)?.[1];
    expect(invoiceId).toBeTruthy();

    const printResponse = await page.context().request.get(`/invoices/${invoiceId}/print`);
    expect(printResponse.ok()).toBeTruthy();
    expect(await printResponse.text()).toContain('INV-2082/83-00001');

    const pdfResponse = await page.context().request.get(`/invoices/${invoiceId}/pdf`);
    expect(pdfResponse.ok()).toBeTruthy();
    expect(pdfResponse.headers()['content-type']).toContain('application/pdf');

    await page.goto(`/items/${item.id}`);
    await expect(page.getByTestId('app-shell-title')).toContainText(itemName);
    await expect(page.getByTestId('item-current-stock')).toHaveText('9.000');

    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await page.keyboard.press('Alt+p');
    await expect(page).toHaveURL(/\/payments\/create/);
    await selectRemoteOption(page, 'payment-open-invoice-select', 'INV-2082/83-00001', `INV-2082/83-00001 (${customerName})`);
    await expect(page.locator('#payment-amount-input')).toHaveValue(/113(?:\.00)?/);
    const paymentCreateResponse = await page.context().request.post('/payments', {
        headers: {
            'X-CSRF-TOKEN': csrfToken ?? '',
            Accept: 'text/html,application/xhtml+xml',
        },
        form: {
            direction: 'received',
            customer_id: String(customer.id),
            invoice_id: String(invoiceId),
            payment_date: new Date().toISOString().slice(0, 10),
            method: 'cash',
            amount: '113',
            notes: '',
        },
    });
    expect(paymentCreateResponse.ok()).toBeTruthy();

    const createdPaymentId = paymentCreateResponse.url().match(/\/payments\/(\d+)$/)?.[1];
    expect(createdPaymentId).toBeTruthy();
    await page.goto(`/payments/${createdPaymentId}`);

    await expect(page.getByTestId('app-shell-title')).toContainText('REC-2082/83-00001');
    await expect(page.getByText('INV-2082/83-00001')).toBeVisible();

    await page.goto(`/invoices/${invoiceId}`);
    await expect(page.getByTestId('invoice-paid-total')).toHaveText('113.00');
    await expect(page.getByTestId('invoice-balance-due')).toHaveText('0.00');
    await expect(page.getByTestId('invoice-payment-status')).toContainText('paid');

    await page.goto('/reports');
    await expect(page.getByTestId('app-shell-title')).toContainText('Reports');

    const salesCsv = await page.context().request.get('/reports/sales?export=csv');
    expect(salesCsv.ok()).toBeTruthy();
    expect(salesCsv.headers()['content-type']).toContain('text/csv');
    expect(await salesCsv.text()).toContain('INV-2082/83-00001');

    const salesXlsx = await page.context().request.get('/reports/sales?export=xlsx');
    expect(salesXlsx.ok()).toBeTruthy();
    expect(salesXlsx.headers()['content-type']).toContain('spreadsheetml');

    const paymentsXlsx = await page.context().request.get('/reports/payments?export=xlsx');
    expect(paymentsXlsx.ok()).toBeTruthy();
    expect(paymentsXlsx.headers()['content-type']).toContain('spreadsheetml');

    const inventoryXlsx = await page.context().request.get('/reports/inventory?export=xlsx');
    expect(inventoryXlsx.ok()).toBeTruthy();
    expect(inventoryXlsx.headers()['content-type']).toContain('spreadsheetml');

    const customerLedgerXlsx = await page.context().request.get(`/reports/customers/${customer.id}/ledger?export=xlsx`);
    expect(customerLedgerXlsx.ok()).toBeTruthy();
    expect(customerLedgerXlsx.headers()['content-type']).toContain('spreadsheetml');
});
