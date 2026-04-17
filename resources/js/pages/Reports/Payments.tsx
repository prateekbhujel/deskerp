import { BsDateInput } from '@/components/forms/BsDateInput';
import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney } from '@/lib/format';
import { paths, withQuery } from '@/lib/paths';
import { PaginatedResponse, SharedProps } from '@/types/shared';
import { router, usePage } from '@inertiajs/react';
import { Button, Card, Select, Space, Statistic, Table } from 'antd';
import { useState } from 'react';

interface PaymentsReportProps {
    payments: PaginatedResponse<{
        id: number;
        payment_date: string;
        payment_number: string;
        direction: string;
        party_name?: string | null;
        invoice_number?: string | null;
        method: string;
        reference_number?: string | null;
        amount: string;
    }>;
    summary: {
        received: number;
        made: number;
    };
    filters: {
        direction: string;
        method: string;
        date_from: string;
        date_to: string;
    };
}

export default function PaymentsReport({ payments, summary, filters }: PaymentsReportProps) {
    const page = usePage<SharedProps>();
    const useBsDates = page.props.settings.displayBsDates;
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = (nextPage = 1) => {
        router.get(
            paths.reports.payments,
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
        <AppShell title="Payment Report" subtitle="Receipts and payments with CSV/XLSX export." activeKey="reports">
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Space wrap size="large">
                    <Statistic title="Received" value={formatMoney(summary.received)} />
                    <Statistic title="Made" value={formatMoney(summary.made)} />
                </Space>

                <Card
                    className="dp-dense-card"
                    extra={
                        <Space wrap>
                            <a href={withQuery(paths.reports.payments, { ...localFilters, export: 'csv' })}>
                                <Button>CSV</Button>
                            </a>
                            <a href={withQuery(paths.reports.payments, { ...localFilters, export: 'xlsx' })}>
                                <Button type="primary">XLSX</Button>
                            </a>
                        </Space>
                    }
                >
                    <div className="grid gap-4 lg:grid-cols-4">
                        <Select
                            allowClear
                            placeholder="Direction"
                            value={localFilters.direction || undefined}
                            onChange={(value) => setLocalFilters((current) => ({ ...current, direction: value ?? '' }))}
                            options={[
                                { value: 'received', label: 'Received' },
                                { value: 'made', label: 'Made' },
                            ]}
                        />
                        <Select
                            allowClear
                            placeholder="Method"
                            value={localFilters.method || undefined}
                            onChange={(value) => setLocalFilters((current) => ({ ...current, method: value ?? '' }))}
                            options={['cash', 'bank', 'card', 'cheque', 'online'].map((method) => ({ value: method, label: method }))}
                        />
                        <BsDateInput value={localFilters.date_from} onChange={(value) => setLocalFilters((current) => ({ ...current, date_from: value }))} displayBsDates={useBsDates} placeholder="Date from" />
                        <BsDateInput value={localFilters.date_to} onChange={(value) => setLocalFilters((current) => ({ ...current, date_to: value }))} displayBsDates={useBsDates} placeholder="Date to" />
                    </div>
                    <Button style={{ marginTop: 16 }} type="primary" onClick={() => applyFilters()}>
                        Apply
                    </Button>
                </Card>

                <Card className="dp-dense-card">
                    <Table
                        rowKey="id"
                        size="small"
                        dataSource={payments.data}
                        pagination={{
                            current: payments.meta.currentPage,
                            total: payments.meta.total,
                            pageSize: payments.meta.perPage,
                            onChange: (pageNumber) => applyFilters(pageNumber),
                        }}
                        columns={[
                            {
                                title: 'Date',
                                render: (_, record) => formatDisplayDate(record.payment_date, useBsDates),
                            },
                            { title: 'Number', dataIndex: 'payment_number' },
                            { title: 'Direction', dataIndex: 'direction' },
                            { title: 'Party', dataIndex: 'party_name', render: (value) => value || '-' },
                            { title: 'Invoice', dataIndex: 'invoice_number', render: (value) => value || '-' },
                            { title: 'Method', dataIndex: 'method' },
                            { title: 'Reference', dataIndex: 'reference_number', render: (value) => value || '-' },
                            { title: 'Amount', align: 'right', render: (_, record) => formatMoney(record.amount) },
                        ]}
                    />
                </Card>
            </Space>
        </AppShell>
    );
}
