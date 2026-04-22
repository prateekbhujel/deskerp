import { AppShell } from '@/components/layout/AppShell';
import { formatMoney } from '@/lib/format';
import { paths } from '@/lib/paths';
import { PaginatedResponse } from '@/types/shared';
import { Link, router } from '@inertiajs/react';
import { Button, Input, Select, Table } from 'antd';
import { useState } from 'react';

interface CustomersIndexProps {
    customers: PaginatedResponse<{
        id: number;
        code?: string | null;
        name: string;
        phone?: string | null;
        email?: string | null;
        opening_balance: string;
        credit_limit: string;
        is_active: boolean;
    }>;
    filters: {
        q: string;
        status: string;
    };
}

export default function CustomersIndex({ customers, filters }: CustomersIndexProps) {
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = (nextPage = 1) => {
        router.get(
            paths.customers.index,
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
        <AppShell title="Customers" subtitle="Customer Register" activeKey="customers">
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Filters</h3>
                    </div>
                    <div className="dp-form-grid">
                        <div className="dp-field col-span-12 xl:col-span-5">
                            <label className="dp-field-label">Search</label>
                            <Input
                                value={localFilters.q}
                                onChange={(event) => setLocalFilters((current) => ({ ...current, q: event.target.value }))}
                                onPressEnter={() => applyFilters()}
                            />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Status</label>
                            <Select
                                allowClear
                                value={localFilters.status || undefined}
                                onChange={(value) => setLocalFilters((current) => ({ ...current, status: value ?? '' }))}
                                options={[
                                    { value: 'active', label: 'ACTIVE' },
                                    { value: 'inactive', label: 'INACTIVE' },
                                ]}
                            />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-5">
                            <label className="dp-field-label">Actions</label>
                            <div>
                                <Button type="primary" onClick={() => applyFilters()}>
                                    Show
                                </Button>{' '}
                                <Link href={paths.customers.create}>
                                    <Button type="primary">New Customer</Button>
                                </Link>{' '}
                                <Button
                                    onClick={() => {
                                        const cleared = { q: '', status: '' };
                                        setLocalFilters(cleared);
                                        router.get(paths.customers.index, {}, { replace: true });
                                    }}
                                >
                                    Reset
                                </Button>
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
                        dataSource={customers.data}
                        locale={{ emptyText: 'No customers found. Create a customer to start invoicing.' }}
                        pagination={{
                            current: customers.meta.currentPage,
                            total: customers.meta.total,
                            pageSize: customers.meta.perPage,
                            onChange: (pageNumber) => applyFilters(pageNumber),
                        }}
                        columns={[
                            {
                                title: 'Customer',
                                render: (_, record) => (
                                    <div>
                                        <div>
                                            <Link href={paths.customers.show(record.id)}>{record.name}</Link>
                                        </div>
                                        <div style={{ color: '#6b7280' }}>{record.code || '-'}</div>
                                    </div>
                                ),
                            },
                            {
                                title: 'Contact',
                                render: (_, record) => (
                                    <div>
                                        <div>{record.phone || '-'}</div>
                                        <div style={{ color: '#6b7280' }}>{record.email || '-'}</div>
                                    </div>
                                ),
                            },
                            { title: 'Opening', width: 120, align: 'right', render: (_, record) => formatMoney(record.opening_balance) },
                            { title: 'Credit Limit', width: 120, align: 'right', render: (_, record) => formatMoney(record.credit_limit) },
                            { title: 'Status', width: 100, render: (_, record) => (record.is_active ? 'ACTIVE' : 'INACTIVE') },
                            { title: 'Action', width: 80, render: (_, record) => <Link href={paths.customers.edit(record.id)}>Edit</Link> },
                        ]}
                    />
                </section>
            </div>
        </AppShell>
    );
}
