import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney } from '@/lib/format';
import { paths } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { Link, usePage } from '@inertiajs/react';
import { Button, Table } from 'antd';

interface CustomerShowProps {
    customer: {
        id: number;
        code?: string | null;
        name: string;
        contact_person?: string | null;
        phone?: string | null;
        email?: string | null;
        tax_number?: string | null;
        opening_balance: string;
        credit_limit: string;
        billing_address?: string | null;
        shipping_address?: string | null;
        notes?: string | null;
        is_active: boolean;
        invoices: Array<{
            id: number;
            invoice_number: string;
            issue_date: string | null;
            total: string;
            balance_due: string;
            status: string;
            payment_status: string;
        }>;
        payments: Array<{
            id: number;
            payment_number: string;
            payment_date: string | null;
            method: string;
            direction: string;
            amount: string;
            reference_number?: string | null;
        }>;
    };
}

export default function CustomerShow({ customer }: CustomerShowProps) {
    const page = usePage<SharedProps>();
    const useBsDates = page.props.settings.displayBsDates;

    return (
        <AppShell title={`Customer ${customer.name}`} subtitle={customer.code || 'Customer Profile'} activeKey="customers">
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Actions</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Link href={paths.customers.edit(customer.id)}>
                            <Button>Edit Customer</Button>
                        </Link>
                        <Link href={paths.invoices.create}>
                            <Button type="primary">New Invoice</Button>
                        </Link>
                        <Link href={paths.payments.createReceived}>
                            <Button>Receive Payment</Button>
                        </Link>
                        <Link href={paths.reports.customerLedger(customer.id)}>
                            <Button>Ledger</Button>
                        </Link>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Profile</h3>
                    </div>
                    <ul className="dp-section-list">
                        <li>
                            <span>Contact Person</span>
                            <span>{customer.contact_person || '-'}</span>
                        </li>
                        <li>
                            <span>Phone</span>
                            <span>{customer.phone || '-'}</span>
                        </li>
                        <li>
                            <span>Email</span>
                            <span>{customer.email || '-'}</span>
                        </li>
                        <li>
                            <span>Tax Number</span>
                            <span>{customer.tax_number || '-'}</span>
                        </li>
                        <li>
                            <span>Opening Balance</span>
                            <span>{formatMoney(customer.opening_balance)}</span>
                        </li>
                        <li>
                            <span>Credit Limit</span>
                            <span>{formatMoney(customer.credit_limit)}</span>
                        </li>
                        <li>
                            <span>Status</span>
                            <span>{customer.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                        </li>
                        <li>
                            <span>Billing Address</span>
                            <span>{customer.billing_address || '-'}</span>
                        </li>
                        <li>
                            <span>Shipping Address</span>
                            <span>{customer.shipping_address || '-'}</span>
                        </li>
                    </ul>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Recent Invoices</h3>
                    </div>
                    <Table
                        rowKey="id"
                        size="small"
                        dataSource={customer.invoices}
                        locale={{ emptyText: 'No invoices yet. Create sales voucher to start customer activity.' }}
                        pagination={false}
                        columns={[
                            {
                                title: 'Invoice',
                                render: (_, record) => <Link href={paths.invoices.show(record.id)}>{record.invoice_number}</Link>,
                            },
                            {
                                title: 'Date',
                                width: 140,
                                render: (_, record) => formatDisplayDate(record.issue_date, useBsDates),
                            },
                            { title: 'Status', width: 120, dataIndex: 'status' },
                            { title: 'Payment', width: 120, dataIndex: 'payment_status' },
                            { title: 'Total', width: 120, align: 'right', render: (_, record) => formatMoney(record.total) },
                            { title: 'Balance', width: 120, align: 'right', render: (_, record) => formatMoney(record.balance_due) },
                        ]}
                    />
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Recent Payments</h3>
                    </div>
                    <Table
                        rowKey="id"
                        size="small"
                        dataSource={customer.payments}
                        locale={{ emptyText: 'No payments yet. Receive payment against invoices from this customer.' }}
                        pagination={false}
                        columns={[
                            {
                                title: 'Voucher',
                                render: (_, record) => <Link href={paths.payments.show(record.id)}>{record.payment_number}</Link>,
                            },
                            {
                                title: 'Date',
                                width: 140,
                                render: (_, record) => formatDisplayDate(record.payment_date, useBsDates),
                            },
                            { title: 'Method', width: 120, dataIndex: 'method' },
                            { title: 'Type', width: 120, dataIndex: 'direction' },
                            { title: 'Amount', width: 120, align: 'right', render: (_, record) => formatMoney(record.amount) },
                        ]}
                    />
                </section>
            </div>
        </AppShell>
    );
}
