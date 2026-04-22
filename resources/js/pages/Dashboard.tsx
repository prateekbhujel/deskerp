import { AppShell } from '@/components/layout/AppShell';
import { usePlatformShortcuts } from '@/hooks/usePlatformShortcuts';
import { paths } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { Link, usePage } from '@inertiajs/react';

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

export default function Dashboard({ stats }: DashboardProps) {
    const page = usePage<SharedProps>();
    const { shortcuts } = usePlatformShortcuts();
    const todaySales = Number(stats.today_sales || 0);
    const pendingReceivables = Number(stats.pending_receivables || 0);

    return (
        <AppShell title="Main Menu" subtitle="Select operation and continue." activeKey="dashboard" mode="Ready">
            <div className="dp-form-page">
                {!page.props.setup.complete ? (
                    <section className="dp-section-block">
                        <div className="dp-section-head">
                            <h3 className="dp-section-title">Setup</h3>
                        </div>
                        <div className="dp-empty-state">
                            <div>Complete required setup before posting vouchers.</div>
                            <div style={{ marginTop: 4 }}>Missing: {page.props.setup.missing.join(', ')}</div>
                            <div style={{ marginTop: 6 }}>
                                <Link className="dp-btn-primary" href={paths.settings}>
                                    Open Settings
                                </Link>
                            </div>
                        </div>
                    </section>
                ) : null}

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Transactions</h3>
                    </div>
                    <ul className="dp-section-list">
                        <li>
                            <Link href={paths.invoices.create}>Sales Voucher</Link>
                            <span className="dp-kbd">{shortcuts.newInvoice}</span>
                        </li>
                        <li>
                            <Link href={paths.payments.createReceived}>Receive Payment</Link>
                            <span className="dp-kbd">{shortcuts.newPayment}</span>
                        </li>
                        <li>
                            <Link href={paths.payments.createMade}>Make Payment</Link>
                            <span className="dp-kbd">{shortcuts.newPayment}</span>
                        </li>
                        <li>
                            <Link href={paths.invoices.index}>Invoices Register</Link>
                            <span>{todaySales.toFixed(2)} today</span>
                        </li>
                        <li>
                            <Link href={paths.payments.index}>Payments Register</Link>
                            <span>{pendingReceivables.toFixed(2)} receivable</span>
                        </li>
                    </ul>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Masters</h3>
                    </div>
                    <ul className="dp-section-list">
                        <li>
                            <a href={paths.customers.index}>Customers</a>
                            <span>{stats.customers}</span>
                        </li>
                        <li>
                            <a href={paths.suppliers.index}>Suppliers</a>
                            <span>{stats.suppliers}</span>
                        </li>
                        <li>
                            <Link href={paths.items.index}>Items & Pricing</Link>
                            <span>{stats.items}</span>
                        </li>
                    </ul>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Reports</h3>
                    </div>
                    <ul className="dp-section-list">
                        <li>
                            <Link href={paths.reports.sales}>Sales Register</Link>
                            <span className="dp-kbd">{shortcuts.reports}</span>
                        </li>
                        <li>
                            <Link href={paths.reports.payments}>Payment Report</Link>
                            <span>{pendingReceivables.toFixed(2)} outstanding</span>
                        </li>
                        <li>
                            <Link href={paths.reports.inventory}>Stock Summary</Link>
                            <span>{stats.low_stock_count} low stock</span>
                        </li>
                    </ul>
                </section>
            </div>
        </AppShell>
    );
}
