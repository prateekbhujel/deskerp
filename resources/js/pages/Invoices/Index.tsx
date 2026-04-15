import { BsDateInput } from '@/components/forms/BsDateInput';
import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney } from '@/lib/format';
import { paths } from '@/lib/paths';
import { PaginatedResponse, SharedProps } from '@/types/shared';
import { Link, router, usePage } from '@inertiajs/react';
import { Button, Card, Input, Select, Space, Table } from 'antd';
import { useState } from 'react';

interface InvoiceIndexProps {
    invoices: PaginatedResponse<{
        id: number;
        invoice_number: string;
        customer_name: string;
        issue_date: string;
        status: string;
        payment_status: string;
        total: string;
        balance_due: string;
    }>;
    filters: {
        q: string;
        status: string;
        payment_status: string;
        date_from: string;
        date_to: string;
    };
}

export default function InvoiceIndex({ invoices, filters }: InvoiceIndexProps) {
    const page = usePage<SharedProps>();
    const useBsDates = page.props.settings.displayBsDates;
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = (nextPage = 1) => {
        router.get(
            paths.invoices.index,
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
            title="Invoices"
            subtitle="Remote-search voucher entry keeps the list fast even when customer and item masters grow."
            activeKey="invoices"
            extra={
                <Link href={paths.invoices.create}>
                    <Button type="primary">New Invoice</Button>
                </Link>
            }
        >
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Card>
                    <div className="grid gap-4 lg:grid-cols-5">
                        <Input
                            data-global-search="true"
                            placeholder="Search invoice, customer, reference"
                            value={localFilters.q}
                            onChange={(event) => setLocalFilters((current) => ({ ...current, q: event.target.value }))}
                            onPressEnter={() => applyFilters()}
                        />
                        <Select
                            allowClear
                            placeholder="Status"
                            value={localFilters.status || undefined}
                            onChange={(value) => setLocalFilters((current) => ({ ...current, status: value ?? '' }))}
                            options={[
                                { value: 'draft', label: 'Draft' },
                                { value: 'final', label: 'Final' },
                            ]}
                        />
                        <Select
                            allowClear
                            placeholder="Payment Status"
                            value={localFilters.payment_status || undefined}
                            onChange={(value) => setLocalFilters((current) => ({ ...current, payment_status: value ?? '' }))}
                            options={[
                                { value: 'unpaid', label: 'Unpaid' },
                                { value: 'partial', label: 'Partial' },
                                { value: 'paid', label: 'Paid' },
                            ]}
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
                                    status: '',
                                    payment_status: '',
                                    date_from: '',
                                    date_to: '',
                                };

                                setLocalFilters(cleared);
                                router.get(paths.invoices.index, {}, { replace: true });
                            }}
                        >
                            Reset
                        </Button>
                    </Space>
                </Card>

                <Card>
                    <Table
                        rowKey="id"
                        dataSource={invoices.data}
                        pagination={{
                            current: invoices.meta.currentPage,
                            total: invoices.meta.total,
                            pageSize: invoices.meta.perPage,
                            onChange: (pageNumber) => applyFilters(pageNumber),
                        }}
                        columns={[
                            {
                                title: 'Invoice',
                                dataIndex: 'invoice_number',
                                render: (_, record) => <Link href={paths.invoices.show(record.id)}>{record.invoice_number}</Link>,
                            },
                            {
                                title: 'Customer',
                                dataIndex: 'customer_name',
                            },
                            {
                                title: 'Date',
                                dataIndex: 'issue_date',
                                render: (value) => formatDisplayDate(value, useBsDates),
                            },
                            {
                                title: 'Status',
                                dataIndex: 'status',
                            },
                            {
                                title: 'Payment',
                                dataIndex: 'payment_status',
                            },
                            {
                                title: 'Total',
                                align: 'right',
                                render: (_, record) => formatMoney(record.total),
                            },
                            {
                                title: 'Balance',
                                align: 'right',
                                render: (_, record) => formatMoney(record.balance_due),
                            },
                            {
                                title: 'Actions',
                                render: (_, record) => (
                                    <Space>
                                        <Link href={paths.invoices.edit(record.id)}>Edit</Link>
                                        <a href={paths.invoices.print(record.id)} target="_blank" rel="noreferrer">
                                            Print
                                        </a>
                                    </Space>
                                ),
                            },
                        ]}
                    />
                </Card>
            </Space>
        </AppShell>
    );
}
