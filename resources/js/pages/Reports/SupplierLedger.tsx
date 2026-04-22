import { BsDateInput } from '@/components/forms/BsDateInput';
import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney } from '@/lib/format';
import { paths, withQuery } from '@/lib/paths';
import { PaginatedResponse, SharedProps } from '@/types/shared';
import { router, usePage } from '@inertiajs/react';
import { Button, Table } from 'antd';
import { useState } from 'react';

interface SupplierLedgerProps {
    supplier: {
        id: number;
        name: string;
    };
    ledger: PaginatedResponse<{
        date: string | null;
        type: string;
        reference: string;
        debit: string;
        credit: string;
        balance: string;
        notes?: string | null;
    }>;
    filters: {
        date_from: string;
        date_to: string;
    };
}

export default function SupplierLedger({ supplier, ledger, filters }: SupplierLedgerProps) {
    const page = usePage<SharedProps>();
    const useBsDates = page.props.settings.displayBsDates;
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = (nextPage = 1) => {
        router.get(
            paths.reports.supplierLedger(supplier.id),
            {
                ...localFilters,
                page: nextPage,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AppShell title={`Supplier Ledger ${supplier.name}`} subtitle="Ledger Statement" activeKey="reports">
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Filters</h3>
                    </div>
                    <div className="dp-form-grid">
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">From</label>
                            <BsDateInput value={localFilters.date_from} onChange={(value) => setLocalFilters((current) => ({ ...current, date_from: value }))} displayBsDates={useBsDates} />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">To</label>
                            <BsDateInput value={localFilters.date_to} onChange={(value) => setLocalFilters((current) => ({ ...current, date_to: value }))} displayBsDates={useBsDates} />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-8">
                            <label className="dp-field-label">Actions</label>
                            <div>
                                <Button type="primary" onClick={() => applyFilters()}>
                                    Show
                                </Button>{' '}
                                <a href={withQuery(paths.reports.supplierLedger(supplier.id), { ...localFilters, export: 'csv' })}>
                                    <Button>Export CSV</Button>
                                </a>{' '}
                                <a href={withQuery(paths.reports.supplierLedger(supplier.id), { ...localFilters, export: 'xlsx' })}>
                                    <Button>Export XLSX</Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Rows</h3>
                    </div>
                    <Table
                        rowKey={(record, index) => `${record.reference}-${index}`}
                        size="small"
                        dataSource={ledger.data}
                        locale={{ emptyText: 'No supplier ledger rows for selected period.' }}
                        pagination={{
                            current: ledger.meta.currentPage,
                            total: ledger.meta.total,
                            pageSize: ledger.meta.perPage,
                            onChange: (pageNumber) => applyFilters(pageNumber),
                        }}
                        columns={[
                            { title: 'Date', render: (_, record) => formatDisplayDate(record.date, useBsDates) },
                            { title: 'Type', dataIndex: 'type' },
                            { title: 'Reference', dataIndex: 'reference' },
                            { title: 'Debit', align: 'right', render: (_, record) => formatMoney(record.debit) },
                            { title: 'Credit', align: 'right', render: (_, record) => formatMoney(record.credit) },
                            { title: 'Balance', align: 'right', render: (_, record) => formatMoney(record.balance) },
                            { title: 'Notes', dataIndex: 'notes', render: (value) => value || '-' },
                        ]}
                    />
                </section>
            </div>
        </AppShell>
    );
}
