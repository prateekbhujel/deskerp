import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney } from '@/lib/format';
import { paths } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { Link, usePage } from '@inertiajs/react';
import { Button } from 'antd';

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
        <AppShell title={payment.payment_number} subtitle="Payment Voucher Details" activeKey="payments">
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Header</h3>
                    </div>
                    <div className="dp-form-grid">
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Direction</label>
                            <div>{payment.direction.toUpperCase()}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Amount</label>
                            <div>{formatMoney(payment.amount)}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Date</label>
                            <div>{formatDisplayDate(payment.payment_date, useBsDates)}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Method</label>
                            <div>{payment.method}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Reference</label>
                            <div>{payment.reference_number || '-'}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Action</label>
                            <div>
                                <Link href={paths.payments.edit(payment.id)}>
                                    <Button>Edit</Button>
                                </Link>
                            </div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-4">
                            <label className="dp-field-label">Customer</label>
                            <div>{payment.customer_name || '-'}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-4">
                            <label className="dp-field-label">Supplier</label>
                            <div>{payment.supplier_name || '-'}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-4">
                            <label className="dp-field-label">Invoice</label>
                            <div>{payment.invoice_id ? <Link href={paths.invoices.show(payment.invoice_id)}>{payment.invoice_number}</Link> : '-'}</div>
                        </div>
                        <div className="dp-field col-span-12">
                            <label className="dp-field-label">Narration</label>
                            <div>{payment.notes || '-'}</div>
                        </div>
                    </div>
                </section>
            </div>
        </AppShell>
    );
}
