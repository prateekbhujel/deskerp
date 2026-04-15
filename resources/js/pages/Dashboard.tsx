import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney, formatQuantity } from '@/lib/format';
import { paths } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { Link, router, usePage } from '@inertiajs/react';
import { Button, Card, Col, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import { useMemo } from 'react';

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

    const dayBook = useMemo(
        () =>
            [
                ...recentInvoices.map((invoice) => ({
                    id: `invoice-${invoice.id}`,
                    date: invoice.issue_date,
                    reference: invoice.invoice_number,
                    narration: invoice.customer_name,
                    type: 'Sales',
                    amount: invoice.total,
                    href: paths.invoices.show(invoice.id),
                    status: invoice.payment_status,
                })),
                ...recentPayments.map((payment) => ({
                    id: `payment-${payment.id}`,
                    date: payment.payment_date,
                    reference: payment.payment_number,
                    narration: payment.customer?.name ?? payment.supplier?.name ?? '-',
                    type: payment.direction === 'received' ? 'Receipt' : 'Payment',
                    amount: payment.amount,
                    href: paths.payments.show(payment.id),
                    status: payment.direction,
                })),
            ]
                .sort((left, right) => String(right.date).localeCompare(String(left.date)))
                .slice(0, 10),
        [recentInvoices, recentPayments],
    );

    return (
        <AppShell
            title="Operations Desk"
            subtitle="Voucher-first home screen for sales, receipts, stock watch, and book navigation."
            activeKey="dashboard"
            extra={
                <Space wrap>
                    <Link href={paths.invoices.create}>
                        <Button type="primary">Sales Voucher</Button>
                    </Link>
                    <Link href={paths.payments.createReceived}>
                        <Button>Receipt Voucher</Button>
                    </Link>
                </Space>
            }
        >
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Row gutter={[12, 12]}>
                    <Col xs={24} lg={10}>
                        <Card title="Voucher Gateway" className="dp-dense-card">
                            <div className="grid gap-3 md:grid-cols-2">
                                <button className="dp-command-card" onClick={() => router.visit(paths.invoices.create)} type="button">
                                    <span>
                                        <strong>Sales Voucher</strong>
                                        <small>Create invoice, finalize stock, print or PDF.</small>
                                    </span>
                                    <span className="dp-kbd">Alt+N</span>
                                </button>
                                <button className="dp-command-card" onClick={() => router.visit(paths.payments.createReceived)} type="button">
                                    <span>
                                        <strong>Receipt Voucher</strong>
                                        <small>Post customer receipt against open invoice.</small>
                                    </span>
                                    <span className="dp-kbd">Alt+P</span>
                                </button>
                                <button className="dp-command-card" onClick={() => router.visit(paths.items.create)} type="button">
                                    <span>
                                        <strong>Item / Pricing</strong>
                                        <small>Maintain stock item, rates, and price tiers.</small>
                                    </span>
                                    <span className="dp-kbd">Alt+M</span>
                                </button>
                                <button className="dp-command-card" onClick={() => router.visit(paths.reports.index)} type="button">
                                    <span>
                                        <strong>Books & Reports</strong>
                                        <small>Sales, payments, inventory, and ledgers.</small>
                                    </span>
                                    <span className="dp-kbd">Alt+R</span>
                                </button>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} lg={14}>
                        <Row gutter={[12, 12]}>
                            <Col xs={12} xl={6}>
                                <Card className="dp-dense-stat">
                                    <Statistic title="Customers" value={stats.customers} />
                                </Card>
                            </Col>
                            <Col xs={12} xl={6}>
                                <Card className="dp-dense-stat">
                                    <Statistic title="Suppliers" value={stats.suppliers} />
                                </Card>
                            </Col>
                            <Col xs={12} xl={6}>
                                <Card className="dp-dense-stat">
                                    <Statistic title="Items" value={stats.items} />
                                </Card>
                            </Col>
                            <Col xs={12} xl={6}>
                                <Card className="dp-dense-stat">
                                    <Statistic title="Month Sales" value={formatMoney(stats.sales_this_month)} />
                                </Card>
                            </Col>
                            <Col xs={24}>
                                <Card title="Work Queue" className="dp-dense-card">
                                    <div className="grid gap-3 md:grid-cols-3">
                                        <div className="dp-queue-card">
                                            <Typography.Text type="secondary">Outstanding Sales</Typography.Text>
                                            <Typography.Title level={3} style={{ margin: '6px 0 0' }}>
                                                {formatMoney(stats.outstanding)}
                                            </Typography.Title>
                                        </div>
                                        <div className="dp-queue-card">
                                            <Typography.Text type="secondary">Low Stock Alerts</Typography.Text>
                                            <Typography.Title level={3} style={{ margin: '6px 0 0' }}>
                                                {lowStockItems.length}
                                            </Typography.Title>
                                        </div>
                                        <div className="dp-queue-card">
                                            <Typography.Text type="secondary">Report Range</Typography.Text>
                                            <Typography.Title level={5} style={{ margin: '6px 0 0' }}>
                                                {page.props.settings.fiscalYear.label ? `FY ${page.props.settings.fiscalYear.label}` : 'Current Month'}
                                            </Typography.Title>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Row gutter={[12, 12]}>
                    <Col xs={24} xl={11}>
                        <Card
                            title="Registers"
                            extra={
                                <Space size={8}>
                                    <span className="dp-kbd">Alt+V</span>
                                    <Link href={paths.invoices.index}>Open Sales Register</Link>
                                </Space>
                            }
                            className="dp-dense-card"
                        >
                            <div className="space-y-2">
                                <button className="dp-register-link" onClick={() => router.visit(paths.invoices.index)} type="button">
                                    <span>
                                        <strong>Sales Register</strong>
                                        <small>Review draft/final invoices, dues, and print actions.</small>
                                    </span>
                                    <span>{recentInvoices.length} recent</span>
                                </button>
                                <button className="dp-register-link" onClick={() => router.visit(paths.payments.index)} type="button">
                                    <span>
                                        <strong>Receipt / Payment Register</strong>
                                        <small>Collections, methods, references, and linked invoices.</small>
                                    </span>
                                    <span>{recentPayments.length} recent</span>
                                </button>
                                <button className="dp-register-link" onClick={() => router.visit(paths.items.index)} type="button">
                                    <span>
                                        <strong>Stock Items Register</strong>
                                        <small>Item master, prices, opening stock, and valuation view.</small>
                                    </span>
                                    <span>{stats.items} items</span>
                                </button>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} xl={13}>
                        <Card
                            title="Books and Statements"
                            extra={
                                <Space size={8}>
                                    <span className="dp-kbd">Alt+R</span>
                                    <Link href={paths.reports.index}>Open Report Centre</Link>
                                </Space>
                            }
                            className="dp-dense-card"
                        >
                            <div className="grid gap-2 md:grid-cols-2">
                                <button className="dp-report-link" onClick={() => router.visit(paths.reports.sales)} type="button">
                                    Sales Report
                                </button>
                                <button className="dp-report-link" onClick={() => router.visit(paths.reports.payments)} type="button">
                                    Payment Report
                                </button>
                                <button className="dp-report-link" onClick={() => router.visit(paths.reports.inventory)} type="button">
                                    Inventory Report
                                </button>
                                <button className="dp-report-link" onClick={() => router.visit(paths.reports.index)} type="button">
                                    Ledger Selection
                                </button>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[12, 12]}>
                    <Col xs={24} xl={15}>
                        <Card title="Day Book" className="dp-dense-card">
                            <Table
                                rowKey="id"
                                size="small"
                                pagination={false}
                                dataSource={dayBook}
                                columns={[
                                    {
                                        title: 'Date',
                                        dataIndex: 'date',
                                        width: 118,
                                        render: (value) => formatDisplayDate(value, useBsDates),
                                    },
                                    {
                                        title: 'Particulars',
                                        render: (_, record) => (
                                            <Space direction="vertical" size={0}>
                                                <Link href={record.href}>{record.reference}</Link>
                                                <Typography.Text type="secondary">{record.narration}</Typography.Text>
                                            </Space>
                                        ),
                                    },
                                    {
                                        title: 'Type',
                                        width: 110,
                                        render: (_, record) => <Tag color={record.type === 'Sales' ? 'blue' : record.type === 'Receipt' ? 'green' : 'orange'}>{record.type}</Tag>,
                                    },
                                    {
                                        title: 'Status',
                                        width: 110,
                                        render: (_, record) => <Typography.Text type="secondary">{record.status}</Typography.Text>,
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

                    <Col xs={24} xl={9}>
                        <Card title="Attention Required" className="dp-dense-card">
                            <Table
                                rowKey="id"
                                size="small"
                                pagination={false}
                                dataSource={lowStockItems}
                                locale={{ emptyText: 'No low stock items.' }}
                                columns={[
                                    {
                                        title: 'Item',
                                        render: (_, record) => <Link href={paths.items.show(record.id)}>{record.name}</Link>,
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
