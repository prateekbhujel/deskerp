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
        <AppShell title="Books and Reports Centre" subtitle="Open registers, export books, and jump directly into party statements." activeKey="reports">
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Row gutter={[12, 12]}>
                    <Col xs={24} lg={14}>
                        <Card title="Business Registers" className="dp-dense-card">
                            <div className="grid gap-3 md:grid-cols-3">
                                <button className="dp-report-block" onClick={() => router.visit(paths.reports.sales)} type="button">
                                    <strong>Sales Book</strong>
                                    <small>Invoices, totals, taxes, balances, CSV/XLSX.</small>
                                </button>
                                <button className="dp-report-block" onClick={() => router.visit(paths.reports.payments)} type="button">
                                    <strong>Receipt Book</strong>
                                    <small>Collections and payments by method and date.</small>
                                </button>
                                <button className="dp-report-block" onClick={() => router.visit(paths.reports.inventory)} type="button">
                                    <strong>Stock Book</strong>
                                    <small>Item quantity, reorder level, and stock value.</small>
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

                <Card title="Export Discipline" className="dp-dense-card">
                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="dp-queue-card">
                            <Typography.Text strong>CSV</Typography.Text>
                            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                Spreadsheet-friendly quick export from every report screen.
                            </Typography.Paragraph>
                        </div>
                        <div className="dp-queue-card">
                            <Typography.Text strong>XLSX</Typography.Text>
                            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                Full filtered dataset download for audit or external sharing.
                            </Typography.Paragraph>
                        </div>
                        <div className="dp-queue-card">
                            <Typography.Text strong>Print / PDF</Typography.Text>
                            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                Invoice print view and PDF stay routed through Laravel.
                            </Typography.Paragraph>
                        </div>
                    </div>
                </Card>
            </Space>
        </AppShell>
    );
}
