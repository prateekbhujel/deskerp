import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney, formatQuantity } from '@/lib/format';
import { paths } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { Link, usePage } from '@inertiajs/react';
import { Button, Card, Col, Row, Space, Statistic, Table, Tag, Typography } from 'antd';

interface DashboardProps {
    stats: {
        customers: number;
        suppliers: number;
        items: number;
        sales_this_month: number;
        outstanding: number;
    };
    recentInvoices: Array<{
        id: number;
        invoice_number: string;
        customer_name: string;
        issue_date: string;
        status: string;
        payment_status: string;
        total: string;
    }>;
    recentPayments: Array<{
        id: number;
        payment_number: string;
        direction: string;
        payment_date: string;
        amount: string;
        customer?: { name: string } | null;
        supplier?: { name: string } | null;
    }>;
    lowStockItems: Array<{
        id: number;
        name: string;
        sku?: string | null;
        current_stock: string;
        reorder_level: string;
    }>;
}

export default function Dashboard({ stats, recentInvoices, recentPayments, lowStockItems }: DashboardProps) {
    const page = usePage<SharedProps>();
    const useBsDates = page.props.settings.displayBsDates;

    return (
        <AppShell
            title="Operations Desk"
            subtitle="DeskERP now runs through the React workspace while Laravel remains the accounting source of truth."
            activeKey="dashboard"
            extra={
                <Space wrap>
                    <Link href={paths.invoices.create}>
                        <Button type="primary">New Invoice</Button>
                    </Link>
                    <Link href={paths.payments.createReceived}>
                        <Button>New Payment</Button>
                    </Link>
                </Space>
            }
        >
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12} xl={6}>
                        <Card>
                            <Statistic title="Customers" value={stats.customers} />
                        </Card>
                    </Col>
                    <Col xs={24} md={12} xl={6}>
                        <Card>
                            <Statistic title="Suppliers" value={stats.suppliers} />
                        </Card>
                    </Col>
                    <Col xs={24} md={12} xl={6}>
                        <Card>
                            <Statistic title="Items" value={stats.items} />
                        </Card>
                    </Col>
                    <Col xs={24} md={12} xl={6}>
                        <Card>
                            <Statistic title="Sales This Month" value={formatMoney(stats.sales_this_month)} />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} xl={16}>
                        <Card
                            title="Sales Register"
                            extra={
                                <Link href={paths.invoices.index}>
                                    <Button type="link">Open Invoices</Button>
                                </Link>
                            }
                        >
                            <Table
                                rowKey="id"
                                size="small"
                                pagination={false}
                                dataSource={recentInvoices}
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
                                        render: (_, record) => (
                                            <Space wrap>
                                                <Tag color={record.status === 'final' ? 'blue' : 'default'}>{record.status}</Tag>
                                                <Tag color={record.payment_status === 'paid' ? 'green' : record.payment_status === 'partial' ? 'orange' : 'red'}>
                                                    {record.payment_status}
                                                </Tag>
                                            </Space>
                                        ),
                                    },
                                    {
                                        title: 'Total',
                                        align: 'right',
                                        render: (_, record) => formatMoney(record.total),
                                    },
                                ]}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} xl={8}>
                        <Card title="Focus Queue">
                            <Space direction="vertical" style={{ display: 'flex' }}>
                                <Card size="small">
                                    <Typography.Text type="secondary">Outstanding Sales</Typography.Text>
                                    <Typography.Title level={3} style={{ margin: '8px 0 0' }}>
                                        {formatMoney(stats.outstanding)}
                                    </Typography.Title>
                                </Card>
                                <Card size="small">
                                    <Typography.Text type="secondary">Low Stock Items</Typography.Text>
                                    <Typography.Title level={3} style={{ margin: '8px 0 0' }}>
                                        {lowStockItems.length}
                                    </Typography.Title>
                                </Card>
                            </Space>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} xl={12}>
                        <Card
                            title="Payment Register"
                            extra={
                                <Link href={paths.payments.index}>
                                    <Button type="link">Open Payments</Button>
                                </Link>
                            }
                        >
                            <Table
                                rowKey="id"
                                size="small"
                                pagination={false}
                                dataSource={recentPayments}
                                columns={[
                                    {
                                        title: 'Number',
                                        dataIndex: 'payment_number',
                                        render: (_, record) => <Link href={paths.payments.show(record.id)}>{record.payment_number}</Link>,
                                    },
                                    {
                                        title: 'Direction',
                                        dataIndex: 'direction',
                                        render: (value) => <Tag color={value === 'received' ? 'green' : 'orange'}>{value}</Tag>,
                                    },
                                    {
                                        title: 'Party',
                                        render: (_, record) => record.customer?.name ?? record.supplier?.name ?? '-',
                                    },
                                    {
                                        title: 'Date',
                                        dataIndex: 'payment_date',
                                        render: (value) => formatDisplayDate(value, useBsDates),
                                    },
                                    {
                                        title: 'Amount',
                                        align: 'right',
                                        render: (_, record) => formatMoney(record.amount),
                                    },
                                ]}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} xl={12}>
                        <Card
                            title="Low Stock Watch"
                            extra={
                                <Link href={paths.reports.inventory}>
                                    <Button type="link">Inventory Report</Button>
                                </Link>
                            }
                        >
                            <Table
                                rowKey="id"
                                size="small"
                                pagination={false}
                                dataSource={lowStockItems}
                                columns={[
                                    {
                                        title: 'Item',
                                        dataIndex: 'name',
                                        render: (_, record) => <Link href={paths.items.show(record.id)}>{record.name}</Link>,
                                    },
                                    {
                                        title: 'SKU',
                                        dataIndex: 'sku',
                                        render: (value) => value ?? '-',
                                    },
                                    {
                                        title: 'Current',
                                        align: 'right',
                                        render: (_, record) => formatQuantity(record.current_stock),
                                    },
                                    {
                                        title: 'Reorder',
                                        align: 'right',
                                        render: (_, record) => formatQuantity(record.reorder_level),
                                    },
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>
            </Space>
        </AppShell>
    );
}
