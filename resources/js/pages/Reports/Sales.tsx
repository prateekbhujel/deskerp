import { BsDateInput } from '@/components/forms/BsDateInput';
import { CustomerLookupRecord } from '@/components/forms/QuickAddCustomerModal';
import { RemoteLookupSelect } from '@/components/forms/RemoteLookupSelect';
import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney } from '@/lib/format';
import { paths, withQuery } from '@/lib/paths';
import { LookupOption, PaginatedResponse, SharedProps } from '@/types/shared';
import { Link, router, usePage } from '@inertiajs/react';
import { Button, Card, Space, Statistic, Table } from 'antd';
import { useState } from 'react';

interface SalesReportProps {
    invoices: PaginatedResponse<{
        id: number;
        issue_date: string;
        invoice_number: string;
        customer_name: string;
        subtotal: string;
        discount_total: string;
        tax_total: string;
        total: string;
        paid_total: string;
        balance_due: string;
    }>;
    summary: {
        total_sales: number;
        total_tax: number;
        total_balance: number;
    };
    filters: {
        q: string;
        customer_id: string;
        date_from: string;
        date_to: string;
    };
    selected_customer: CustomerLookupRecord | null;
}

export default function SalesReport({ invoices, summary, filters, selected_customer }: SalesReportProps) {
    const page = usePage<SharedProps>();
    const useBsDates = page.props.settings.displayBsDates;
    const [localFilters, setLocalFilters] = useState(filters);
    const [customerOption, setCustomerOption] = useState<LookupOption<CustomerLookupRecord> | null>(
        selected_customer
            ? {
                  value: selected_customer.id,
                  label: selected_customer.name,
                  record: selected_customer,
              }
            : null,
    );

    const applyFilters = (nextPage = 1) => {
        router.get(
            paths.reports.sales,
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
        <AppShell title="Sales Report" subtitle="Filtered invoice summary with CSV/XLSX export." activeKey="reports">
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Space wrap size="large">
                    <Statistic title="Total Sales" value={formatMoney(summary.total_sales)} />
                    <Statistic title="Total Tax" value={formatMoney(summary.total_tax)} />
                    <Statistic title="Outstanding" value={formatMoney(summary.total_balance)} />
                </Space>

                <Card
                    className="dp-dense-card"
                    extra={
                        <Space wrap>
                            <a href={withQuery(paths.reports.sales, { ...localFilters, export: 'csv' })}>
                                <Button>CSV</Button>
                            </a>
                            <a href={withQuery(paths.reports.sales, { ...localFilters, export: 'xlsx' })}>
                                <Button type="primary">XLSX</Button>
                            </a>
                        </Space>
                    }
                >
                    <div className="grid gap-4 lg:grid-cols-4">
                        <RemoteLookupSelect<CustomerLookupRecord>
                            endpoint={paths.lookups.customers}
                            value={customerOption}
                            onChange={(option) => {
                                setCustomerOption(option);
                                setLocalFilters((current) => ({ ...current, customer_id: option ? String(option.record.id) : '' }));
                            }}
                            mapOption={(record) => ({
                                value: Number(record.id),
                                label: record.name,
                                record,
                            })}
                            placeholder="Customer"
                        />
                        <BsDateInput value={localFilters.date_from} onChange={(value) => setLocalFilters((current) => ({ ...current, date_from: value }))} displayBsDates={useBsDates} placeholder="Date from" />
                        <BsDateInput value={localFilters.date_to} onChange={(value) => setLocalFilters((current) => ({ ...current, date_to: value }))} displayBsDates={useBsDates} placeholder="Date to" />
                        <Button type="primary" onClick={() => applyFilters()}>
                            Apply
                        </Button>
                    </div>
                </Card>

                <Card className="dp-dense-card">
                    <Table
                        rowKey="id"
                        size="small"
                        dataSource={invoices.data}
                        locale={{ emptyText: 'No sales data found for selected filters.' }}
                        pagination={{
                            current: invoices.meta.currentPage,
                            total: invoices.meta.total,
                            pageSize: invoices.meta.perPage,
                            onChange: (pageNumber) => applyFilters(pageNumber),
                        }}
                        columns={[
                            {
                                title: 'Date',
                                render: (_, record) => formatDisplayDate(record.issue_date, useBsDates),
                            },
                            {
                                title: 'Invoice',
                                render: (_, record) => <Link href={paths.invoices.show(record.id)}>{record.invoice_number}</Link>,
                            },
                            { title: 'Customer', dataIndex: 'customer_name' },
                            { title: 'Subtotal', align: 'right', render: (_, record) => formatMoney(record.subtotal) },
                            { title: 'Discount', align: 'right', render: (_, record) => formatMoney(record.discount_total) },
                            { title: 'Tax', align: 'right', render: (_, record) => formatMoney(record.tax_total) },
                            { title: 'Total', align: 'right', render: (_, record) => formatMoney(record.total) },
                            { title: 'Paid', align: 'right', render: (_, record) => formatMoney(record.paid_total) },
                            { title: 'Balance', align: 'right', render: (_, record) => formatMoney(record.balance_due) },
                        ]}
                    />
                </Card>
            </Space>
        </AppShell>
    );
}
