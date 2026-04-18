import { CustomerLookupRecord } from '@/components/forms/QuickAddCustomerModal';
import { RemoteLookupSelect } from '@/components/forms/RemoteLookupSelect';
import { AppShell } from '@/components/layout/AppShell';
import { paths } from '@/lib/paths';
import { LookupOption } from '@/types/shared';
import { router } from '@inertiajs/react';
import { Button, Card, Col, Row, Space, Typography } from 'antd';
import { useState } from 'react';

interface SupplierLookupRecord {
    id: number;
    name: string;
}

export default function ReportsIndex() {
    const [customerOption, setCustomerOption] = useState<LookupOption<CustomerLookupRecord> | null>(null);
    const [supplierOption, setSupplierOption] = useState<LookupOption<SupplierLookupRecord> | null>(null);

    return (
        <AppShell title="Reports" subtitle="Sales, payments, inventory, and ledger statements." activeKey="reports">
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Row gutter={[12, 12]}>
                    <Col xs={24} lg={14}>
                        <Card title="Operational Reports" className="dp-dense-card">
                            <div className="grid gap-3 md:grid-cols-3">
                                <button className="dp-report-block" onClick={() => router.visit(paths.reports.sales)} type="button">
                                    <strong>Sales Report</strong>
                                    <small>Invoices, taxes, receivables, CSV/XLSX export.</small>
                                </button>
                                <button className="dp-report-block" onClick={() => router.visit(paths.reports.payments)} type="button">
                                    <strong>Payment Report</strong>
                                    <small>Receipts/payments by method and date.</small>
                                </button>
                                <button className="dp-report-block" onClick={() => router.visit(paths.reports.inventory)} type="button">
                                    <strong>Inventory Report</strong>
                                    <small>Current stock, reorder level, stock value.</small>
                                </button>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} lg={10}>
                        <Card title="Ledger Navigation" className="dp-dense-card">
                            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                                <div>
                                    <Typography.Text strong>Customer Ledger</Typography.Text>
                                    <div style={{ marginTop: 8 }}>
                                        <RemoteLookupSelect<CustomerLookupRecord>
                                            endpoint={paths.lookups.customers}
                                            value={customerOption}
                                            onChange={setCustomerOption}
                                            mapOption={(record) => ({
                                                value: Number(record.id),
                                                label: record.name,
                                                record,
                                            })}
                                            placeholder="Search customer"
                                        />
                                    </div>
                                    <Button
                                        type="primary"
                                        style={{ marginTop: 10 }}
                                        disabled={!customerOption}
                                        onClick={() => customerOption && router.visit(paths.reports.customerLedger(customerOption.record.id))}
                                    >
                                        Open Customer Statement
                                    </Button>
                                </div>

                                <div>
                                    <Typography.Text strong>Supplier Ledger</Typography.Text>
                                    <div style={{ marginTop: 8 }}>
                                        <RemoteLookupSelect<SupplierLookupRecord>
                                            endpoint={paths.lookups.suppliers}
                                            value={supplierOption}
                                            onChange={setSupplierOption}
                                            mapOption={(record) => ({
                                                value: Number(record.id),
                                                label: record.name,
                                                record,
                                            })}
                                            placeholder="Search supplier"
                                        />
                                    </div>
                                    <Button
                                        type="primary"
                                        style={{ marginTop: 10 }}
                                        disabled={!supplierOption}
                                        onClick={() => supplierOption && router.visit(paths.reports.supplierLedger(supplierOption.record.id))}
                                    >
                                        Open Supplier Statement
                                    </Button>
                                </div>
                            </Space>
                        </Card>
                    </Col>
                </Row>

                <Card title="Export Formats" className="dp-dense-card">
                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="dp-queue-card">
                            <Typography.Text strong>CSV</Typography.Text>
                            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                Fast spreadsheet export from every report.
                            </Typography.Paragraph>
                        </div>
                        <div className="dp-queue-card">
                            <Typography.Text strong>XLSX</Typography.Text>
                            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                Full filtered workbook download.
                            </Typography.Paragraph>
                        </div>
                        <div className="dp-queue-card">
                            <Typography.Text strong>Print / PDF</Typography.Text>
                            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                Invoice print and PDF available in invoice module.
                            </Typography.Paragraph>
                        </div>
                    </div>
                </Card>
            </Space>
        </AppShell>
    );
}
