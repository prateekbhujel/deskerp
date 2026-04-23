import { BsDateInput } from '@/components/forms/BsDateInput';
import { RemoteLookupSelect } from '@/components/forms/RemoteLookupSelect';
import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney } from '@/lib/format';
import { paths, withQuery } from '@/lib/paths';
import { LookupOption, PaginatedResponse, SharedProps } from '@/types/shared';
import { Link, router, usePage } from '@inertiajs/react';
import { Button, Table } from 'antd';
import { useState } from 'react';

interface CustomerLookupRecord {
    id: number;
    name: string;
}

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
        total_sales: string;
        total_tax: string;
        total_balance: string;
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
        <AppShell title="Sales Report" subtitle="Sales Register" activeKey="reports">
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Summary</h3>
                    </div>
                    <div className="dp-summary-grid">
                        <span>Total Sales</span>
                        <strong>{formatMoney(summary.total_sales)}</strong>
                        <span>Total Tax</span>
                        <strong>{formatMoney(summary.total_tax)}</strong>
                        <span className="dp-summary-total">Outstanding</span>
                        <strong className="dp-summary-total">{formatMoney(summary.total_balance)}</strong>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Filters</h3>
                    </div>
                    <div className="dp-form-grid">
                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Customer</label>
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
                            />
                        </div>

                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">From</label>
                            <BsDateInput value={localFilters.date_from} onChange={(value) => setLocalFilters((current) => ({ ...current, date_from: value }))} displayBsDates={useBsDates} />
                        </div>

                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">To</label>
                            <BsDateInput value={localFilters.date_to} onChange={(value) => setLocalFilters((current) => ({ ...current, date_to: value }))} displayBsDates={useBsDates} />
                        </div>

                        <div className="dp-field col-span-12 xl:col-span-5">
                            <label className="dp-field-label">Actions</label>
                            <div>
                                <Button type="primary" onClick={() => applyFilters()}>
                                    Show
                                </Button>{' '}
                                <Button onClick={() => window.print()}>Print</Button>{' '}
                                <a href={withQuery(paths.reports.sales, { ...localFilters, export: 'csv' })}>
                                    <Button>Export CSV</Button>
                                </a>{' '}
                                <a href={withQuery(paths.reports.sales, { ...localFilters, export: 'xlsx' })}>
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
                        rowKey="id"
                        size="small"
                        dataSource={invoices.data}
                        locale={{ emptyText: 'No sales rows for current filters.' }}
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
                </section>
            </div>
        </AppShell>
    );
}
