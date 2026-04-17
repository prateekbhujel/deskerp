import { BsDateInput } from '@/components/forms/BsDateInput';
import { AppShell } from '@/components/layout/AppShell';
import { coerceNumber, formatDisplayDate, formatMoney } from '@/lib/format';
import { paths } from '@/lib/paths';
import { PaginatedResponse, SharedProps } from '@/types/shared';
import { Link, router, usePage } from '@inertiajs/react';
import { Button, Card, Input, Select, Space, Table, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';

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

    const summary = useMemo(
        () => ({
            visibleRecords: invoices.data.length,
            finalCount: invoices.data.filter((invoice) => invoice.status === 'final').length,
            unpaidCount: invoices.data.filter((invoice) => invoice.payment_status !== 'paid').length,
            pageBalance: invoices.data.reduce((carry, invoice) => carry + coerceNumber(invoice.balance_due), 0),
        }),
        [invoices.data],
    );

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
            title="Invoice Register"
            subtitle="Invoice list with status, receivable tracking, and print access."
            activeKey="invoices"
            extra={
                <Space wrap>
                    <Link href={paths.reports.sales}>
                        <Button>Sales Report</Button>
                    </Link>
                    <Link href={paths.invoices.create}>
                        <Button type="primary">New Invoice</Button>
                    </Link>
                </Space>
            }
        >
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <div className="grid gap-3 lg:grid-cols-4">
                    <Card className="dp-dense-stat">
                        <Typography.Text type="secondary">Visible Records</Typography.Text>
                        <Typography.Title level={4} style={{ margin: '6px 0 0' }}>
                            {summary.visibleRecords}
                        </Typography.Title>
                    </Card>
                    <Card className="dp-dense-stat">
                        <Typography.Text type="secondary">Final Invoices</Typography.Text>
                        <Typography.Title level={4} style={{ margin: '6px 0 0' }}>
                            {summary.finalCount}
                        </Typography.Title>
                    </Card>
                    <Card className="dp-dense-stat">
                        <Typography.Text type="secondary">Open Collections</Typography.Text>
                        <Typography.Title level={4} style={{ margin: '6px 0 0' }}>
                            {summary.unpaidCount}
                        </Typography.Title>
                    </Card>
                    <Card className="dp-dense-stat">
                        <Typography.Text type="secondary">Page Balance Due</Typography.Text>
                        <Typography.Title level={4} style={{ margin: '6px 0 0' }}>
                            {formatMoney(summary.pageBalance)}
                        </Typography.Title>
                    </Card>
                </div>

                <Card className="dp-dense-card">
                    <div className="grid gap-3 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
                        <Input
                            data-global-search="true"
                            placeholder="Search invoice, customer, reference"
                            value={localFilters.q}
                            onChange={(event) => setLocalFilters((current) => ({ ...current, q: event.target.value }))}
                            onPressEnter={() => applyFilters()}
                        />
                        <Select
                            allowClear
                            placeholder="Voucher status"
                            value={localFilters.status || undefined}
                            onChange={(value) => setLocalFilters((current) => ({ ...current, status: value ?? '' }))}
                            options={[
                                { value: 'draft', label: 'Draft' },
                                { value: 'final', label: 'Final' },
                            ]}
                        />
                        <Select
                            allowClear
                            placeholder="Collection"
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
                            placeholder="From"
                        />
                        <BsDateInput
                            value={localFilters.date_to}
                            onChange={(value) => setLocalFilters((current) => ({ ...current, date_to: value }))}
                            displayBsDates={useBsDates}
                            placeholder="To"
                        />
                        <Space>
                            <Button type="primary" onClick={() => applyFilters()}>
                                Apply
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
                    </div>
                </Card>

                <Card className="dp-dense-card">
                    <Table
                        rowKey="id"
                        size="small"
                        dataSource={invoices.data}
                        pagination={{
                            current: invoices.meta.currentPage,
                            total: invoices.meta.total,
                            pageSize: invoices.meta.perPage,
                            onChange: (pageNumber) => applyFilters(pageNumber),
                        }}
                        columns={[
                            {
                                title: 'Voucher',
                                render: (_, record) => (
                                    <Space direction="vertical" size={0}>
                                        <Link href={paths.invoices.show(record.id)}>{record.invoice_number}</Link>
                                        <Typography.Text type="secondary">{record.customer_name}</Typography.Text>
                                    </Space>
                                ),
                            },
                            {
                                title: 'Date',
                                width: 118,
                                dataIndex: 'issue_date',
                                render: (value) => formatDisplayDate(value, useBsDates),
                            },
                            {
                                title: 'Status',
                                width: 138,
                                render: (_, record) => (
                                    <Space wrap size={[4, 4]}>
                                        <Tag color={record.status === 'final' ? 'blue' : 'default'}>{record.status}</Tag>
                                        <Tag color={record.payment_status === 'paid' ? 'green' : record.payment_status === 'partial' ? 'orange' : 'red'}>
                                            {record.payment_status}
                                        </Tag>
                                    </Space>
                                ),
                            },
                            {
                                title: 'Total',
                                width: 120,
                                align: 'right',
                                render: (_, record) => formatMoney(record.total),
                            },
                            {
                                title: 'Due',
                                width: 120,
                                align: 'right',
                                render: (_, record) => formatMoney(record.balance_due),
                            },
                            {
                                title: 'Actions',
                                width: 150,
                                render: (_, record) => (
                                    <Space size={10}>
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
