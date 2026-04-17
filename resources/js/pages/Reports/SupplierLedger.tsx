import { BsDateInput } from '@/components/forms/BsDateInput';
import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney } from '@/lib/format';
import { paths, withQuery } from '@/lib/paths';
import { PaginatedResponse, SharedProps } from '@/types/shared';
import { router, usePage } from '@inertiajs/react';
import { Button, Card, Space, Table } from 'antd';
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
        <AppShell title={`Supplier Ledger: ${supplier.name}`} subtitle="Supplier statement with running balance and export." activeKey="reports">
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Card
                    className="dp-dense-card"
                    extra={
                        <Space wrap>
                            <a href={withQuery(paths.reports.supplierLedger(supplier.id), { ...localFilters, export: 'csv' })}>
                                <Button>CSV</Button>
                            </a>
                            <a href={withQuery(paths.reports.supplierLedger(supplier.id), { ...localFilters, export: 'xlsx' })}>
                                <Button type="primary">XLSX</Button>
                            </a>
                        </Space>
                    }
                >
                    <div className="grid gap-4 lg:grid-cols-3">
                        <BsDateInput value={localFilters.date_from} onChange={(value) => setLocalFilters((current) => ({ ...current, date_from: value }))} displayBsDates={useBsDates} placeholder="Date from" />
                        <BsDateInput value={localFilters.date_to} onChange={(value) => setLocalFilters((current) => ({ ...current, date_to: value }))} displayBsDates={useBsDates} placeholder="Date to" />
                        <Button type="primary" onClick={() => applyFilters()}>
                            Apply
                        </Button>
                    </div>
                </Card>

                <Card className="dp-dense-card">
                    <Table
                        rowKey={(record, index) => `${record.reference}-${index}`}
                        size="small"
                        dataSource={ledger.data}
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
                </Card>
            </Space>
        </AppShell>
    );
}
