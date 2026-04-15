import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney, formatQuantity } from '@/lib/format';
import { paths } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { Link, usePage } from '@inertiajs/react';
import { Button, Card, Descriptions, Space, Table, Tag } from 'antd';

interface InvoiceShowProps {
    invoice: {
        id: number;
        invoice_number: string;
        status: string;
        payment_status: string;
        issue_date: string | null;
        due_date: string | null;
        reference_number?: string | null;
        notes?: string | null;
        customer_name: string;
        billing_address?: string | null;
        tax_number?: string | null;
        subtotal: string;
        discount_total: string;
        tax_total: string;
        total: string;
        paid_total: string;
        balance_due: string;
        finalized_at?: string | null;
        created_by?: string | null;
        lines: Array<{
            id: number;
            description: string;
            unit_name: string;
            quantity: string;
            rate: string;
            discount_percent: string;
            tax_percent: string;
            total: string;
        }>;
        payments: Array<{
            id: number;
            payment_number: string;
            payment_date: string;
            method: string;
            amount: string;
        }>;
    };
}

export default function InvoiceShow({ invoice }: InvoiceShowProps) {
    const page = usePage<SharedProps>();
    const useBsDates = page.props.settings.displayBsDates;

    return (
        <AppShell
            title={invoice.invoice_number}
            subtitle="Printable invoice, PDF download, payment tracking, and stock-impacting finalization stay on the Laravel backend."
            activeKey="invoices"
            extra={
                <Space wrap>
                    <Link href={paths.invoices.edit(invoice.id)}>
                        <Button>Edit</Button>
                    </Link>
                    <a href={paths.invoices.print(invoice.id)} target="_blank" rel="noreferrer">
                        <Button>Print</Button>
                    </a>
                    <a href={paths.invoices.pdf(invoice.id)} target="_blank" rel="noreferrer">
                        <Button type="primary">PDF</Button>
                    </a>
                </Space>
            }
        >
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Card>
                    <Descriptions column={{ xs: 1, md: 2, xl: 3 }} bordered>
                        <Descriptions.Item label="Customer">{invoice.customer_name}</Descriptions.Item>
                        <Descriptions.Item label="Issue Date">{formatDisplayDate(invoice.issue_date, useBsDates)}</Descriptions.Item>
                        <Descriptions.Item label="Due Date">{formatDisplayDate(invoice.due_date, useBsDates)}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Space wrap>
                                <Tag color={invoice.status === 'final' ? 'blue' : 'default'}>{invoice.status}</Tag>
                                <Tag color={invoice.payment_status === 'paid' ? 'green' : invoice.payment_status === 'partial' ? 'orange' : 'red'}>
                                    {invoice.payment_status}
                                </Tag>
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Reference">{invoice.reference_number || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Created By">{invoice.created_by || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Billing Address" span={2}>
                            {invoice.billing_address || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tax Number">{invoice.tax_number || '-'}</Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card title="Invoice Lines">
                    <Table
                        rowKey="id"
                        pagination={false}
                        dataSource={invoice.lines}
                        columns={[
                            { title: 'Description', dataIndex: 'description' },
                            { title: 'Unit', dataIndex: 'unit_name' },
                            { title: 'Qty', align: 'right', render: (_, record) => formatQuantity(record.quantity) },
                            { title: 'Rate', align: 'right', render: (_, record) => formatMoney(record.rate) },
                            { title: 'Disc %', align: 'right', dataIndex: 'discount_percent' },
                            { title: 'Tax %', align: 'right', dataIndex: 'tax_percent' },
                            { title: 'Total', align: 'right', render: (_, record) => formatMoney(record.total) },
                        ]}
                    />
                </Card>

                <Card title="Payments">
                    <Table
                        rowKey="id"
                        pagination={false}
                        dataSource={invoice.payments}
                        columns={[
                            {
                                title: 'Number',
                                render: (_, record) => <Link href={paths.payments.show(record.id)}>{record.payment_number}</Link>,
                            },
                            {
                                title: 'Date',
                                render: (_, record) => formatDisplayDate(record.payment_date, useBsDates),
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
                        ]}
                    />
                </Card>

                <Card title="Totals">
                    <Descriptions column={{ xs: 1, md: 2, xl: 3 }} bordered>
                        <Descriptions.Item label="Subtotal">{formatMoney(invoice.subtotal)}</Descriptions.Item>
                        <Descriptions.Item label="Discount">{formatMoney(invoice.discount_total)}</Descriptions.Item>
                        <Descriptions.Item label="Tax">{formatMoney(invoice.tax_total)}</Descriptions.Item>
                        <Descriptions.Item label="Total">{formatMoney(invoice.total)}</Descriptions.Item>
                        <Descriptions.Item label="Paid">{formatMoney(invoice.paid_total)}</Descriptions.Item>
                        <Descriptions.Item label="Balance Due">{formatMoney(invoice.balance_due)}</Descriptions.Item>
                    </Descriptions>
                </Card>
            </Space>
        </AppShell>
    );
}
