import { expect, Page, test } from '@playwright/test';

async function ensureCompanySelected(page: Page) {
    await page.goto('/company');

    if (await page.getByRole('button', { name: /Continue With This Company|Use This Company/i }).isVisible().catch(() => false)) {
        await page.getByRole('button', { name: /Continue With This Company|Use This Company/i }).click();
        return;
    }

    await page.getByLabel('Company Name').fill('DeskERP');
    await page.getByLabel('Fiscal Year').fill('2082/83');
    await page.getByLabel('Fiscal Start (AD)').fill('2026-04-14');
    await page.getByLabel('Fiscal End (AD)').fill('2027-04-13');
    await page.getByLabel('Admin Name').fill('DeskERP Admin');
    await page.getByLabel('Admin Username').fill('admin');
    await page.getByLabel('Admin Password').fill('deskerp123');
    await page.getByLabel('Confirm Password').fill('deskerp123');
    await page.getByRole('button', { name: /Create Company|Save New Company Profile/i }).click();
}

test('smoke checks invoicing, payments, inventory, reports, and exports', async ({ page }) => {
    test.setTimeout(120000);

    const unique = `${Date.now()}`;
    const customerName = `PW Customer ${unique}`;
    const itemName = `PW Item ${unique}`;
    const supplierName = `PW Supplier ${unique}`;

    await ensureCompanySelected(page);

    await page.goto('/login');
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('deskerp123');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('app-shell-title')).toContainText('DESKERP');

    await page.goto('/settings');
    await page.getByRole('tab', { name: /Fiscal/i }).click();
    await page.getByTestId('settings-fiscal-year-label').fill('2082/83');
    await page.getByTestId('settings-save').click();

    await page.goto('/invoices/create');

    await page.getByRole('button', { name: /Add Customer/ }).click();
    const customerResponsePromise = page.waitForResponse((response) => response.url().endsWith('/customers') && response.request().method() === 'POST' && response.status() === 200);
    await page.getByTestId('quick-customer-name').fill(customerName);
    await page.getByRole('button', { name: 'Save Customer' }).click();
    const customer = await (await customerResponsePromise).json();

    await page.goto('/customers');
    await expect(page.getByRole('link', { name: customerName })).toBeVisible();

    await page.goto('/invoices/create');

    await page.getByRole('button', { name: 'Add Item' }).click();
    const itemResponsePromise = page.waitForResponse((response) => response.url().endsWith('/items') && response.request().method() === 'POST' && response.status() === 200);
    await page.getByTestId('quick-item-name').fill(itemName);
    await page.getByTestId('quick-item-selling-price').fill('100');
    await page.getByTestId('quick-item-tax-rate').fill('13');
    await page.getByTestId('quick-item-opening-stock').fill('10');
    await page.getByRole('button', { name: 'Save Item' }).click();
    const item = await (await itemResponsePromise).json();

    await page.goto('/suppliers/create');
    await page.getByTestId('supplier-name-input').fill(supplierName);
    await page.getByRole('button', { name: /Save/ }).first().click();
    await expect(page).toHaveURL(/\/suppliers\/\d+$/);
    await expect(page.getByText('RECENT PAYMENTS')).toBeVisible();

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
            'lines[0][unit_name]': item.unit ?? 'PCS',
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
    await expect(page.getByTestId('invoice-total')).toHaveText('113.00');
    await expect(page.getByTestId('invoice-paid-total')).toHaveText('0.00');
    await expect(page.getByTestId('invoice-balance-due')).toHaveText('113.00');
    await expect(page.getByTestId('invoice-payment-status')).toContainText('UNPAID');

    const invoiceId = page.url().match(/\/invoices\/(\d+)$/)?.[1];
    expect(invoiceId).toBeTruthy();

    const printResponse = await page.context().request.get(`/invoices/${invoiceId}/print`);
    expect(printResponse.ok()).toBeTruthy();

    const pdfResponse = await page.context().request.get(`/invoices/${invoiceId}/pdf`);
    expect(pdfResponse.ok()).toBeTruthy();
    expect(pdfResponse.headers()['content-type']).toContain('application/pdf');

    await page.goto(`/items/${item.id}`);
    await expect(page.getByTestId('item-current-stock')).toHaveText('9.000');

    await page.goto('/payments/create?direction=received');
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
    await expect(page.getByText(/INV-/)).toBeVisible();

    await page.goto(`/invoices/${invoiceId}`);
    await expect(page.getByTestId('invoice-paid-total')).toHaveText('113.00');
    await expect(page.getByTestId('invoice-balance-due')).toHaveText('0.00');
    await expect(page.getByTestId('invoice-payment-status')).toContainText('PAID');

    const salesCsv = await page.context().request.get('/reports/sales?export=csv');
    expect(salesCsv.ok()).toBeTruthy();
    expect(salesCsv.headers()['content-type']).toContain('text/csv');

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
