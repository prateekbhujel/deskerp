import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney } from '@/lib/format';
import { paths } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { Link, usePage } from '@inertiajs/react';
import { Button, Card, Descriptions, Space } from 'antd';

interface PaymentsShowProps {
    payment: {
        id: number;
        payment_number: string;
        direction: string;
        payment_date: string | null;
        method: string;
        reference_number?: string | null;
        amount: string;
        notes?: string | null;
        customer_name?: string | null;
        supplier_name?: string | null;
        invoice_number?: string | null;
        invoice_id?: number | null;
    };
}

export default function PaymentsShow({ payment }: PaymentsShowProps) {
    const page = usePage<SharedProps>();
    const useBsDates = page.props.settings.displayBsDates;

    return (
        <AppShell
            title={payment.payment_number}
            subtitle="Payment posting and outstanding-balance refresh are still handled by Laravel services."
            activeKey="payments"
            extra={
                <Link href={paths.payments.edit(payment.id)}>
                    <Button>Edit Payment</Button>
                </Link>
            }
        >
            <Card>
                <Descriptions column={{ xs: 1, md: 2 }} bordered>
                    <Descriptions.Item label="Direction">{payment.direction}</Descriptions.Item>
                    <Descriptions.Item label="Amount">{formatMoney(payment.amount)}</Descriptions.Item>
                    <Descriptions.Item label="Payment Date">{formatDisplayDate(payment.payment_date, useBsDates)}</Descriptions.Item>
                    <Descriptions.Item label="Method">{payment.method}</Descriptions.Item>
                    <Descriptions.Item label="Customer">{payment.customer_name || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Supplier">{payment.supplier_name || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Invoice">
                        {payment.invoice_id ? <Link href={paths.invoices.show(payment.invoice_id)}>{payment.invoice_number}</Link> : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Reference">{payment.reference_number || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Notes" span={2}>
                        {payment.notes || '-'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        </AppShell>
    );
}
