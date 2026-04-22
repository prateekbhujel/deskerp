import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney } from '@/lib/format';
import { paths } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { Link, usePage } from '@inertiajs/react';
import { Button, Table } from 'antd';

interface SupplierShowProps {
    supplier: {
        id: number;
        code?: string | null;
        name: string;
        contact_person?: string | null;
        phone?: string | null;
        email?: string | null;
        tax_number?: string | null;
        opening_balance: string;
        billing_address?: string | null;
        notes?: string | null;
        is_active: boolean;
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

export default function SupplierShow({ supplier }: SupplierShowProps) {
    const page = usePage<SharedProps>();
    const useBsDates = page.props.settings.displayBsDates;

    return (
        <AppShell title={`Supplier ${supplier.name}`} subtitle={supplier.code || 'Supplier Profile'} activeKey="suppliers">
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Actions</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Link href={paths.suppliers.edit(supplier.id)}>
                            <Button>Edit Supplier</Button>
                        </Link>
                        <Link href={paths.payments.createMade}>
                            <Button type="primary">Make Payment</Button>
                        </Link>
                        <Link href={paths.reports.supplierLedger(supplier.id)}>
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
                            <span>{supplier.contact_person || '-'}</span>
                        </li>
                        <li>
                            <span>Phone</span>
                            <span>{supplier.phone || '-'}</span>
                        </li>
                        <li>
                            <span>Email</span>
                            <span>{supplier.email || '-'}</span>
                        </li>
                        <li>
                            <span>Tax Number</span>
                            <span>{supplier.tax_number || '-'}</span>
                        </li>
                        <li>
                            <span>Opening Balance</span>
                            <span>{formatMoney(supplier.opening_balance)}</span>
                        </li>
                        <li>
                            <span>Status</span>
                            <span>{supplier.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                        </li>
                        <li>
                            <span>Billing Address</span>
                            <span>{supplier.billing_address || '-'}</span>
                        </li>
                        <li>
                            <span>Notes</span>
                            <span>{supplier.notes || '-'}</span>
                        </li>
                    </ul>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Recent Payments</h3>
                    </div>
                    <Table
                        rowKey="id"
                        size="small"
                        dataSource={supplier.payments}
                        locale={{ emptyText: 'No payments yet. Record payment vouchers against this supplier.' }}
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
