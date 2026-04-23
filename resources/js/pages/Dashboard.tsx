import { AppShell } from '@/components/layout/AppShell';
import { formatMoney } from '@/lib/format';
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

export default function Dashboard({ stats, recentInvoices, recentPayments, lowStockItems }: DashboardProps) {
    const page = usePage<SharedProps>();

    return (
        <AppShell title="Main Menu" subtitle="Company operations" activeKey="dashboard" mode="Ready">
            <div className="dp-form-page">
                {!page.props.setup.complete ? (
                    <section className="dp-section-block">
                        <div className="dp-section-head">
                            <h3 className="dp-section-title">Setup Required</h3>
                        </div>
                        <div className="dp-empty-state">
                            <div>Complete company and fiscal settings before regular voucher entry.</div>
                            <div style={{ marginTop: 6 }}>Missing: {page.props.setup.missing.join(', ')}</div>
                            <div className="dp-action-row">
                                <Link className="dp-btn-primary" href={paths.settings}>
                                    Open Settings
                                </Link>
                            </div>
                        </div>
                    </section>
                ) : null}

                <div className="dp-main-menu-grid">
                    <section className="dp-section-block">
                        <div className="dp-section-head">
                            <h3 className="dp-section-title">Transactions</h3>
                        </div>
                        <ul className="dp-section-list">
                            <li>
                                <Link href={paths.invoices.create}>Sales Voucher</Link>
                                <span>New invoice</span>
                            </li>
                            <li>
                                <Link href={paths.payments.createReceived}>Receive Payment</Link>
                                <span>Customer receipt</span>
                            </li>
                            <li>
                                <Link href={paths.payments.createMade}>Make Payment</Link>
                                <span>Supplier payment</span>
                            </li>
                            <li>
                                <Link href={paths.invoices.index}>Invoices Register</Link>
                                <span>{formatMoney(stats.today_sales)} today</span>
                            </li>
                            <li>
                                <Link href={paths.payments.index}>Payments Register</Link>
                                <span>{formatMoney(stats.pending_receivables)} receivable</span>
                            </li>
                        </ul>
                    </section>

                    <section className="dp-section-block">
                        <div className="dp-section-head">
                            <h3 className="dp-section-title">Masters</h3>
                        </div>
                        <ul className="dp-section-list">
                            <li>
                                <Link href={paths.customers.index}>Customers</Link>
                                <span>{stats.customers}</span>
                            </li>
                            <li>
                                <Link href={paths.suppliers.index}>Suppliers</Link>
                                <span>{stats.suppliers}</span>
                            </li>
                            <li>
                                <Link href={paths.items.index}>Items & Pricing</Link>
                                <span>{stats.items}</span>
                            </li>
                            <li>
                                <Link href={paths.settings}>Fiscal Setup</Link>
                                <span>{page.props.settings.fiscalYear.label || 'Pending'}</span>
                            </li>
                        </ul>
                    </section>
                </div>

                <div className="dp-main-menu-grid">
                    <section className="dp-section-block">
                        <div className="dp-section-head">
                            <h3 className="dp-section-title">Reports</h3>
                        </div>
                        <ul className="dp-section-list">
                            <li>
                                <Link href={paths.reports.sales}>Sales Register</Link>
                                <span>Invoices by date</span>
                            </li>
                            <li>
                                <Link href={paths.reports.payments}>Payment Report</Link>
                                <span>Receipts and payments</span>
                            </li>
                            <li>
                                <Link href={paths.reports.inventory}>Stock Summary</Link>
                                <span>{stats.low_stock_count} low stock</span>
                            </li>
                            <li>
                                <Link href={paths.reports.index}>Report Center</Link>
                                <span>Ledger and exports</span>
                            </li>
                        </ul>
                    </section>

                    <section className="dp-section-block">
                        <div className="dp-section-head">
                            <h3 className="dp-section-title">Business Snapshot</h3>
                        </div>
                        <ul className="dp-section-list">
                            <li>
                                <span>Company</span>
                                <strong>{page.props.settings.companyName || 'DeskERP'}</strong>
                            </li>
                            <li>
                                <span>Fiscal Year</span>
                                <strong>{page.props.settings.fiscalYear.label || 'Not set'}</strong>
                            </li>
                            <li>
                                <span>Calendar</span>
                                <strong>{page.props.settings.displayBsDates ? 'BS display' : 'AD display'}</strong>
                            </li>
                            <li>
                                <span>Version</span>
                                <strong>v{page.props.appVersion}</strong>
                            </li>
                        </ul>
                    </section>
                </div>

                <div className="dp-main-menu-grid">
                    <section className="dp-section-block">
                        <div className="dp-section-head">
                            <h3 className="dp-section-title">Recent Invoices</h3>
                        </div>
                        {recentInvoices.length ? (
                            <ul className="dp-section-list">
                                {recentInvoices.map((invoice) => (
                                    <li key={invoice.id}>
                                        <Link href={paths.invoices.show(invoice.id)}>{invoice.invoice_number}</Link>
                                        <span>{invoice.customer_name}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="dp-empty-state">No invoices recorded yet.</div>
                        )}
                    </section>

                    <section className="dp-section-block">
                        <div className="dp-section-head">
                            <h3 className="dp-section-title">Recent Payments</h3>
                        </div>
                        {recentPayments.length ? (
                            <ul className="dp-section-list">
                                {recentPayments.map((payment) => (
                                    <li key={payment.id}>
                                        <Link href={paths.payments.show(payment.id)}>{payment.payment_number}</Link>
                                        <span>{payment.customer?.name || payment.supplier?.name || '-'}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="dp-empty-state">No payments recorded yet.</div>
                        )}
                    </section>
                </div>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Stock Attention</h3>
                    </div>
                    {lowStockItems.length ? (
                        <ul className="dp-section-list">
                            {lowStockItems.map((item) => (
                                <li key={item.id}>
                                    <Link href={paths.items.show(item.id)}>{item.name}</Link>
                                    <span>
                                        {item.current_stock} / reorder {item.reorder_level}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="dp-empty-state">No low-stock items at the moment.</div>
                    )}
                </section>
            </div>
        </AppShell>
    );
}
