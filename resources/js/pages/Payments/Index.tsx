import { BsDateInput } from '@/components/forms/BsDateInput';
import { AppShell } from '@/components/layout/AppShell';
import { coerceNumber, formatDisplayDate, formatMoney } from '@/lib/format';
import { paths } from '@/lib/paths';
import { PaginatedResponse, SharedProps } from '@/types/shared';
import { Link, router, usePage } from '@inertiajs/react';
import { Button, Card, Input, Select, Space, Table, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';

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

    const summary = useMemo(
        () => ({
            visibleRecords: payments.data.length,
            receivedTotal: payments.data.filter((payment) => payment.direction === 'received').reduce((carry, payment) => carry + coerceNumber(payment.amount), 0),
            madeTotal: payments.data.filter((payment) => payment.direction === 'made').reduce((carry, payment) => carry + coerceNumber(payment.amount), 0),
            invoiceLinked: payments.data.filter((payment) => payment.invoice_number).length,
        }),
        [payments.data],
    );

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
            title="Payments Register"
            subtitle="Receipts and payments with filters, methods, and invoice linkage."
            activeKey="payments"
            extra={
                <Space wrap>
                    <Link href={paths.reports.payments}>
                        <Button>Payment Report</Button>
                    </Link>
                    <Link href={paths.payments.createReceived}>
                        <Button type="primary">New Payment</Button>
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
                        <Typography.Text type="secondary">Receipts on Page</Typography.Text>
                        <Typography.Title level={4} style={{ margin: '6px 0 0' }}>
                            {formatMoney(summary.receivedTotal)}
                        </Typography.Title>
                    </Card>
                    <Card className="dp-dense-stat">
                        <Typography.Text type="secondary">Payments on Page</Typography.Text>
                        <Typography.Title level={4} style={{ margin: '6px 0 0' }}>
                            {formatMoney(summary.madeTotal)}
                        </Typography.Title>
                    </Card>
                    <Card className="dp-dense-stat">
                        <Typography.Text type="secondary">Invoice Linked</Typography.Text>
                        <Typography.Title level={4} style={{ margin: '6px 0 0' }}>
                            {summary.invoiceLinked}
                        </Typography.Title>
                    </Card>
                </div>

                <Card className="dp-dense-card">
                    <div className="grid gap-3 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
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
                    </div>
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
                                title: 'Voucher',
                                render: (_, record) => (
                                    <Space direction="vertical" size={0}>
                                        <Link href={paths.payments.show(record.id)}>{record.payment_number}</Link>
                                        <Typography.Text type="secondary">{record.party_name || '-'}</Typography.Text>
                                    </Space>
                                ),
                            },
                            {
                                title: 'Direction',
                                width: 116,
                                render: (_, record) => <Tag color={record.direction === 'received' ? 'green' : 'orange'}>{record.direction}</Tag>,
                            },
                            {
                                title: 'Invoice',
                                render: (_, record) => <Typography.Text type="secondary">{record.invoice_number || 'Standalone voucher'}</Typography.Text>,
                            },
                            {
                                title: 'Date',
                                width: 118,
                                dataIndex: 'payment_date',
                                render: (value) => formatDisplayDate(value, useBsDates),
                            },
                            {
                                title: 'Method',
                                width: 120,
                                dataIndex: 'method',
                            },
                            {
                                title: 'Amount',
                                width: 120,
                                align: 'right',
                                render: (_, record) => formatMoney(record.amount),
                            },
                            {
                                title: 'Action',
                                width: 80,
                                render: (_, record) => <Link href={paths.payments.edit(record.id)}>Edit</Link>,
                            },
                        ]}
                    />
                </Card>
            </Space>
        </AppShell>
    );
}
