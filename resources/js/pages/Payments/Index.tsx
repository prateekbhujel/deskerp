import { BsDateInput } from '@/components/forms/BsDateInput';
import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney } from '@/lib/format';
import { paths } from '@/lib/paths';
import { PaginatedResponse, SharedProps } from '@/types/shared';
import { Link, router, usePage } from '@inertiajs/react';
import { Button, Card, Input, Select, Space, Table } from 'antd';
import { useState } from 'react';

interface PaymentsIndexProps {
    payments: PaginatedResponse<{
        id: number;
        payment_number: string;
        direction: string;
        party_name?: string | null;
        invoice_number?: string | null;
        payment_date: string;
        method: string;
        amount: string;
    }>;
    filters: {
        q: string;
        direction: string;
        method: string;
        date_from: string;
        date_to: string;
    };
    methods: string[];
}

export default function PaymentsIndex({ payments, filters, methods }: PaymentsIndexProps) {
    const page = usePage<SharedProps>();
    const useBsDates = page.props.settings.displayBsDates;
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = (nextPage = 1) => {
        router.get(
            paths.payments.index,
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
        <AppShell
            title="Payments"
            subtitle="Receipts and payments stay linked to invoices where needed, with Laravel still enforcing overpayment protection."
            activeKey="payments"
            extra={
                <Link href={paths.payments.createReceived}>
                    <Button type="primary">New Payment</Button>
                </Link>
            }
        >
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Card>
                    <div className="grid gap-4 lg:grid-cols-5">
                        <Input
                            data-global-search="true"
                            placeholder="Search payment number or reference"
                            value={localFilters.q}
                            onChange={(event) => setLocalFilters((current) => ({ ...current, q: event.target.value }))}
                            onPressEnter={() => applyFilters()}
                        />
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
                            options={methods.map((method) => ({
                                value: method,
                                label: method,
                            }))}
                        />
                        <BsDateInput
                            value={localFilters.date_from}
                            onChange={(value) => setLocalFilters((current) => ({ ...current, date_from: value }))}
                            displayBsDates={useBsDates}
                            placeholder="Date from"
                        />
                        <BsDateInput
                            value={localFilters.date_to}
                            onChange={(value) => setLocalFilters((current) => ({ ...current, date_to: value }))}
                            displayBsDates={useBsDates}
                            placeholder="Date to"
                        />
                    </div>
                    <Space style={{ marginTop: 16 }}>
                        <Button type="primary" onClick={() => applyFilters()}>
                            Apply Filters
                        </Button>
                        <Button
                            onClick={() => {
                                const cleared = {
                                    q: '',
                                    direction: '',
                                    method: '',
                                    date_from: '',
                                    date_to: '',
                                };
                                setLocalFilters(cleared);
                                router.get(paths.payments.index, {}, { replace: true });
                            }}
                        >
                            Reset
                        </Button>
                    </Space>
                </Card>

                <Card>
                    <Table
                        rowKey="id"
                        dataSource={payments.data}
                        pagination={{
                            current: payments.meta.currentPage,
                            total: payments.meta.total,
                            pageSize: payments.meta.perPage,
                            onChange: (pageNumber) => applyFilters(pageNumber),
                        }}
                        columns={[
                            {
                                title: 'Number',
                                render: (_, record) => <Link href={paths.payments.show(record.id)}>{record.payment_number}</Link>,
                            },
                            {
                                title: 'Direction',
                                dataIndex: 'direction',
                            },
                            {
                                title: 'Party',
                                dataIndex: 'party_name',
                                render: (value) => value || '-',
                            },
                            {
                                title: 'Invoice',
                                dataIndex: 'invoice_number',
                                render: (value) => value || '-',
                            },
                            {
                                title: 'Date',
                                dataIndex: 'payment_date',
                                render: (value) => formatDisplayDate(value, useBsDates),
                            },
                            {
                                title: 'Method',
                                dataIndex: 'method',
                            },
                            {
                                title: 'Amount',
                                align: 'right',
                                render: (_, record) => formatMoney(record.amount),
                            },
                            {
                                title: 'Actions',
                                render: (_, record) => <Link href={paths.payments.edit(record.id)}>Edit</Link>,
                            },
                        ]}
                    />
                </Card>
            </Space>
        </AppShell>
    );
}
