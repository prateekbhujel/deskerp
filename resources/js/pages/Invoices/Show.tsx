import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney, formatQuantity } from '@/lib/format';
import { paths } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { Link, usePage } from '@inertiajs/react';
import { Button, Table } from 'antd';

interface InvoiceShowProps {
    invoice: {
        id: number;
        invoice_number: string;
        status: string;
        payment_status: string;
        issue_date: string | null;
        due_date: string | null;
        reference_number?: string | null;
        notes?: string | null;
        customer_name: string;
        billing_address?: string | null;
        tax_number?: string | null;
        subtotal: string;
        discount_total: string;
        tax_total: string;
        total: string;
        paid_total: string;
        balance_due: string;
        finalized_at?: string | null;
        created_by?: string | null;
        lines: Array<{
            id: number;
            description: string;
            unit_name: string;
            quantity: string;
            rate: string;
            discount_percent: string;
            tax_percent: string;
            total: string;
        }>;
        payments: Array<{
            id: number;
            payment_number: string;
            payment_date: string;
            method: string;
            amount: string;
        }>;
    };
}

export default function InvoiceShow({ invoice }: InvoiceShowProps) {
    const page = usePage<SharedProps>();
    const useBsDates = page.props.settings.displayBsDates;

    return (
        <AppShell title={invoice.invoice_number} subtitle="Sales Voucher Details" activeKey="invoices" mode={invoice.status === 'final' ? 'Posted' : 'Draft'}>
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Header</h3>
                    </div>
                    <div className="dp-form-grid">
                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Customer</label>
                            <div>{invoice.customer_name}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Issue Date</label>
                            <div>{formatDisplayDate(invoice.issue_date, useBsDates)}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Due Date</label>
                            <div>{formatDisplayDate(invoice.due_date, useBsDates)}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Status</label>
                            <div data-testid="invoice-payment-status">
                                {invoice.status.toUpperCase()} / {invoice.payment_status.toUpperCase()}
                            </div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Reference</label>
                            <div>{invoice.reference_number || '-'}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-6">
                            <label className="dp-field-label">Billing Address</label>
                            <div>{invoice.billing_address || '-'}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Tax Number</label>
                            <div>{invoice.tax_number || '-'}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Created By</label>
                            <div>{invoice.created_by || '-'}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Actions</label>
                            <div>
                                <Link href={paths.invoices.edit(invoice.id)}>
                                    <Button>Edit</Button>
                                </Link>{' '}
                                <a href={paths.invoices.print(invoice.id)} target="_blank" rel="noreferrer">
                                    <Button>Print</Button>
                                </a>{' '}
                                <a href={paths.invoices.pdf(invoice.id)} target="_blank" rel="noreferrer">
                                    <Button type="primary">PDF</Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Voucher Lines</h3>
                    </div>
                    <Table
                        rowKey="id"
                        size="small"
                        pagination={false}
                        dataSource={invoice.lines}
                        locale={{ emptyText: 'No line items found.' }}
                        columns={[
                            { title: 'Description', dataIndex: 'description' },
                            { title: 'Unit', dataIndex: 'unit_name' },
                            { title: 'Qty', align: 'right', render: (_, record) => formatQuantity(record.quantity) },
                            { title: 'Rate', align: 'right', render: (_, record) => formatMoney(record.rate) },
                            { title: 'Disc %', align: 'right', dataIndex: 'discount_percent' },
                            { title: 'Tax %', align: 'right', dataIndex: 'tax_percent' },
                            { title: 'Total', align: 'right', render: (_, record) => formatMoney(record.total) },
                        ]}
                    />
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Payments</h3>
                    </div>
                    <Table
                        rowKey="id"
                        size="small"
                        pagination={false}
                        dataSource={invoice.payments}
                        locale={{ emptyText: 'No linked payments yet.' }}
                        columns={[
                            { title: 'Voucher', render: (_, record) => <Link href={paths.payments.show(record.id)}>{record.payment_number}</Link> },
                            { title: 'Date', render: (_, record) => formatDisplayDate(record.payment_date, useBsDates) },
                            { title: 'Method', dataIndex: 'method' },
                            { title: 'Amount', align: 'right', render: (_, record) => formatMoney(record.amount) },
                        ]}
                    />
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Totals</h3>
                    </div>
                    <div className="dp-summary-grid">
                        <span>Subtotal</span>
                        <strong>{formatMoney(invoice.subtotal)}</strong>
                        <span>Discount</span>
                        <strong>{formatMoney(invoice.discount_total)}</strong>
                        <span>Tax</span>
                        <strong>{formatMoney(invoice.tax_total)}</strong>
                        <span>Total</span>
                        <strong data-testid="invoice-total">{formatMoney(invoice.total)}</strong>
                        <span>Paid</span>
                        <strong data-testid="invoice-paid-total">{formatMoney(invoice.paid_total)}</strong>
                        <span className="dp-summary-total">Balance</span>
                        <strong className="dp-summary-total" data-testid="invoice-balance-due">
                            {formatMoney(invoice.balance_due)}
                        </strong>
                    </div>
                </section>
            </div>
        </AppShell>
    );
}
