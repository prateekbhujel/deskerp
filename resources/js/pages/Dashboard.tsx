import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney, formatQuantity } from '@/lib/format';
import { paths } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { Link, router, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Col, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import { useMemo } from 'react';

interface DashboardProps {
    stats: {
        customers: number;
        suppliers: number;
        items: number;
        today_sales: number;
        pending_receivables: number;
        low_stock_count: number;
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

    const setupMissing = useMemo(() => page.props.setup.missing.join(', '), [page.props.setup.missing]);

    return (
        <AppShell
            title="Dashboard"
            subtitle="Daily operations, receivables, stock alerts, and quick voucher entry."
            activeKey="dashboard"
            extra={
                <Space wrap>
                    <Link href={paths.invoices.create}>
                        <Button type="primary">New Invoice</Button>
                    </Link>
                    <Link href={paths.payments.createReceived}>
                        <Button>Receive Payment</Button>
                    </Link>
                    <Link href={paths.items.create}>
                        <Button>Add Item</Button>
                    </Link>
                    <Link href={paths.reports.index}>
                        <Button>Reports</Button>
                    </Link>
                </Space>
            }
        >
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                {!page.props.setup.complete ? (
                    <Alert
                        type="warning"
                        showIcon
                        message="Setup Required"
                        description={
                            <Space direction="vertical" size={4}>
                                <Typography.Text>Complete settings before regular billing: {setupMissing}.</Typography.Text>
                                <Link href={paths.settings}>Open Settings</Link>
                            </Space>
                        }
                    />
                ) : null}

                <Row gutter={[12, 12]}>
                    <Col xs={12} xl={4}>
                        <Card className="dp-dense-stat">
                            <Statistic title="Today Sales" value={formatMoney(stats.today_sales)} />
                        </Card>
                    </Col>
                    <Col xs={12} xl={4}>
                        <Card className="dp-dense-stat">
                            <Statistic title="Receivables" value={formatMoney(stats.pending_receivables)} />
                        </Card>
                    </Col>
                    <Col xs={12} xl={4}>
                        <Card className="dp-dense-stat">
                            <Statistic title="Low Stock" value={stats.low_stock_count} />
                        </Card>
                    </Col>
                    <Col xs={12} xl={4}>
                        <Card className="dp-dense-stat">
                            <Statistic title="Items" value={stats.items} />
                        </Card>
                    </Col>
                    <Col xs={12} xl={4}>
                        <Card className="dp-dense-stat">
                            <Statistic title="Customers" value={stats.customers} />
                        </Card>
                    </Col>
                    <Col xs={12} xl={4}>
                        <Card className="dp-dense-stat">
                            <Statistic title="Suppliers" value={stats.suppliers} />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[12, 12]}>
                    <Col xs={24} xl={14}>
                        <Card
                            title="Recent Invoices"
                            className="dp-dense-card"
                            extra={
                                <Link href={paths.invoices.index}>
                                    <Button size="small">View All</Button>
                                </Link>
                            }
                        >
                            <Table
                                rowKey="id"
                                size="small"
                                pagination={false}
                                locale={{ emptyText: 'No invoices yet.' }}
                                dataSource={recentInvoices}
                                columns={[
                                    {
                                        title: 'Invoice',
                                        render: (_, record) => (
                                            <Space direction="vertical" size={0}>
                                                <Link href={paths.invoices.show(record.id)}>{record.invoice_number}</Link>
                                                <Typography.Text type="secondary">{record.customer_name}</Typography.Text>
                                            </Space>
                                        ),
                                    },
                                    {
                                        title: 'Date',
                                        width: 128,
                                        render: (_, record) => formatDisplayDate(record.issue_date, useBsDates),
                                    },
                                    {
                                        title: 'Status',
                                        width: 158,
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
                                        width: 126,
                                        align: 'right',
                                        render: (_, record) => formatMoney(record.total),
                                    },
                                ]}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} xl={10}>
                        <Card
                            title="Recent Payments"
                            className="dp-dense-card"
                            extra={
                                <Link href={paths.payments.index}>
                                    <Button size="small">View All</Button>
                                </Link>
                            }
                        >
                            <Table
                                rowKey="id"
                                size="small"
                                pagination={false}
                                locale={{ emptyText: 'No payments yet.' }}
                                dataSource={recentPayments}
                                columns={[
                                    {
                                        title: 'Voucher',
                                        render: (_, record) => (
                                            <Space direction="vertical" size={0}>
                                                <Link href={paths.payments.show(record.id)}>{record.payment_number}</Link>
                                                <Typography.Text type="secondary">
                                                    {record.customer?.name ?? record.supplier?.name ?? '-'}
                                                </Typography.Text>
                                            </Space>
                                        ),
                                    },
                                    {
                                        title: 'Type',
                                        width: 114,
                                        render: (_, record) => <Tag color={record.direction === 'received' ? 'green' : 'orange'}>{record.direction}</Tag>,
                                    },
                                    {
                                        title: 'Amount',
                                        width: 120,
                                        align: 'right',
                                        render: (_, record) => formatMoney(record.amount),
                                    },
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[12, 12]}>
                    <Col xs={24} xl={14}>
                        <Card title="Quick Actions" className="dp-dense-card">
                            <div className="grid gap-3 md:grid-cols-2">
                                <button className="dp-command-card" onClick={() => router.visit(paths.invoices.create)} type="button">
                                    <span>
                                        <strong>New Invoice</strong>
                                        <small>Create and finalize a sales invoice.</small>
                                    </span>
                                    <span className="dp-kbd">Alt+N</span>
                                </button>
                                <button className="dp-command-card" onClick={() => router.visit(paths.payments.createReceived)} type="button">
                                    <span>
                                        <strong>Receive Payment</strong>
                                        <small>Record receipt and link outstanding invoice.</small>
                                    </span>
                                    <span className="dp-kbd">Alt+P</span>
                                </button>
                                <button className="dp-command-card" onClick={() => router.visit(paths.items.create)} type="button">
                                    <span>
                                        <strong>Add Item</strong>
                                        <small>Update item pricing and opening stock.</small>
                                    </span>
                                    <span className="dp-kbd">Alt+M</span>
                                </button>
                                <button className="dp-command-card" onClick={() => router.visit(paths.reports.index)} type="button">
                                    <span>
                                        <strong>Open Reports</strong>
                                        <small>Sales, payment, inventory, and ledger exports.</small>
                                    </span>
                                    <span className="dp-kbd">Alt+R</span>
                                </button>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} xl={10}>
                        <Card title="Low Stock Items" className="dp-dense-card">
                            <Table
                                rowKey="id"
                                size="small"
                                pagination={false}
                                locale={{ emptyText: 'No low stock items.' }}
                                dataSource={lowStockItems}
                                columns={[
                                    {
                                        title: 'Item',
                                        render: (_, record) => (
                                            <Space direction="vertical" size={0}>
                                                <Link href={paths.items.show(record.id)}>{record.name}</Link>
                                                <Typography.Text type="secondary">{record.sku || '-'}</Typography.Text>
                                            </Space>
                                        ),
                                    },
                                    {
                                        title: 'Current',
                                        width: 110,
                                        align: 'right',
                                        render: (_, record) => formatQuantity(record.current_stock),
                                    },
                                    {
                                        title: 'Reorder',
                                        width: 110,
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
