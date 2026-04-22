import { RemoteLookupSelect } from '@/components/forms/RemoteLookupSelect';
import { AppShell } from '@/components/layout/AppShell';
import { usePlatformShortcuts } from '@/hooks/usePlatformShortcuts';
import { paths } from '@/lib/paths';
import { LookupOption } from '@/types/shared';
import { router } from '@inertiajs/react';
import { Button } from 'antd';
import { useState } from 'react';

interface CustomerLookupRecord {
    id: number;
    name: string;
}

interface SupplierLookupRecord {
    id: number;
    name: string;
}

export default function ReportsIndex() {
    const [customerOption, setCustomerOption] = useState<LookupOption<CustomerLookupRecord> | null>(null);
    const [supplierOption, setSupplierOption] = useState<LookupOption<SupplierLookupRecord> | null>(null);
    const { shortcuts } = usePlatformShortcuts();

    return (
        <AppShell title="Reports" subtitle={`Report center | ${shortcuts.reports} open reports`} activeKey="reports" mode="Posted">
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Operational Reports</h3>
                    </div>
                    <div className="dp-section-body">
                        <div className="grid gap-2 md:grid-cols-3">
                            <button className="dp-report-link" onClick={() => router.visit(paths.reports.sales)} type="button">
                                <span>Sales Report</span>
                                <span>CSV/XLSX</span>
                            </button>
                            <button className="dp-report-link" onClick={() => router.visit(paths.reports.payments)} type="button">
                                <span>Payment Report</span>
                                <span>CSV/XLSX</span>
                            </button>
                            <button className="dp-report-link" onClick={() => router.visit(paths.reports.inventory)} type="button">
                                <span>Inventory Report</span>
                                <span>CSV/XLSX</span>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Ledger Lookup</h3>
                    </div>
                    <div className="dp-section-body">
                        <div className="dp-form-grid">
                            <div className="dp-field col-span-12 xl:col-span-6">
                                <label className="dp-field-label">Customer Ledger</label>
                                <RemoteLookupSelect<CustomerLookupRecord>
                                    endpoint={paths.lookups.customers}
                                    value={customerOption}
                                    onChange={setCustomerOption}
                                    mapOption={(record) => ({
                                        value: Number(record.id),
                                        label: record.name,
                                        record,
                                    })}
                                />
                                <Button style={{ marginTop: 6 }} type="primary" disabled={!customerOption} onClick={() => customerOption && router.visit(paths.reports.customerLedger(customerOption.record.id))}>
                                    Open Customer Ledger
                                </Button>
                            </div>

                            <div className="dp-field col-span-12 xl:col-span-6">
                                <label className="dp-field-label">Supplier Ledger</label>
                                <RemoteLookupSelect<SupplierLookupRecord>
                                    endpoint={paths.lookups.suppliers}
                                    value={supplierOption}
                                    onChange={setSupplierOption}
                                    mapOption={(record) => ({
                                        value: Number(record.id),
                                        label: record.name,
                                        record,
                                    })}
                                />
                                <Button style={{ marginTop: 6 }} type="primary" disabled={!supplierOption} onClick={() => supplierOption && router.visit(paths.reports.supplierLedger(supplierOption.record.id))}>
                                    Open Supplier Ledger
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Export Modes</h3>
                    </div>
                    <div className="dp-section-body">
                        <span className="dp-kbd">CSV</span> <span className="dp-kbd">XLSX</span> <span className="dp-kbd">Print</span>
                    </div>
                </section>
            </div>
        </AppShell>
    );
}
