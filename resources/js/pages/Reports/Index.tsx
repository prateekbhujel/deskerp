import { RemoteLookupSelect } from '@/components/forms/RemoteLookupSelect';
import { AppShell } from '@/components/layout/AppShell';
import { paths } from '@/lib/paths';
import { LookupOption } from '@/types/shared';
import { router } from '@inertiajs/react';
import { Button, Table } from 'antd';
import { useMemo, useState } from 'react';

interface CustomerLookupRecord {
    id: number;
    name: string;
}

interface SupplierLookupRecord {
    id: number;
    name: string;
}

export default function ReportsIndex() {
    const [customerOption, setCustomerOption] = useState<LookupOption<CustomerLookupRecord> | null>(null);
    const [supplierOption, setSupplierOption] = useState<LookupOption<SupplierLookupRecord> | null>(null);

    const reports = useMemo(
        () => [
            {
                key: 'sales',
                name: 'Sales Register',
                scope: 'Finalized sales invoices',
                path: paths.reports.sales,
            },
            {
                key: 'payments',
                name: 'Payment Report',
                scope: 'Payment received and payment made',
                path: paths.reports.payments,
            },
            {
                key: 'inventory',
                name: 'Stock Summary',
                scope: 'Current stock, reorder, and valuation',
                path: paths.reports.inventory,
            },
        ],
        [],
    );

    return (
        <AppShell title="Report Center" subtitle="Operational reports and ledger lookup" activeKey="reports" mode="Posted">
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Available Reports</h3>
                    </div>
                    <Table
                        rowKey="key"
                        size="small"
                        pagination={false}
                        dataSource={reports}
                        columns={[
                            { title: 'Report', dataIndex: 'name' },
                            { title: 'Scope', dataIndex: 'scope' },
                            {
                                title: 'Action',
                                width: 120,
                                render: (_, record) => (
                                    <Button type="primary" onClick={() => router.visit(record.path)}>
                                        Open
                                    </Button>
                                ),
                            },
                        ]}
                    />
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Ledger Lookup</h3>
                    </div>
                    <div className="dp-form-grid">
                        <div className="dp-field col-span-12 xl:col-span-6">
                            <label className="dp-field-label">Customer Ledger</label>
                            <div className="dp-lookup-row">
                                <RemoteLookupSelect<CustomerLookupRecord>
                                    endpoint={paths.lookups.customers}
                                    value={customerOption}
                                    onChange={setCustomerOption}
                                    mapOption={(record) => ({
                                        value: Number(record.id),
                                        label: record.name,
                                        record,
                                    })}
                                />
                                <Button type="primary" disabled={!customerOption} onClick={() => customerOption && router.visit(paths.reports.customerLedger(customerOption.record.id))}>
                                    Open
                                </Button>
                            </div>
                        </div>

                        <div className="dp-field col-span-12 xl:col-span-6">
                            <label className="dp-field-label">Supplier Ledger</label>
                            <div className="dp-lookup-row">
                                <RemoteLookupSelect<SupplierLookupRecord>
                                    endpoint={paths.lookups.suppliers}
                                    value={supplierOption}
                                    onChange={setSupplierOption}
                                    mapOption={(record) => ({
                                        value: Number(record.id),
                                        label: record.name,
                                        record,
                                    })}
                                />
                                <Button type="primary" disabled={!supplierOption} onClick={() => supplierOption && router.visit(paths.reports.supplierLedger(supplierOption.record.id))}>
                                    Open
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </AppShell>
    );
}
