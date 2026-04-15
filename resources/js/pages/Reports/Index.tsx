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
        <AppShell
            title="Reports"
            subtitle="Sales, payments, inventory, and ledger reports now share server-side filters plus CSV/XLSX export."
            activeKey="reports"
        >
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12} xl={8}>
                        <Card title="Sales Report">
                            <Typography.Paragraph>Invoice register with fiscal-year defaults and CSV/XLSX export.</Typography.Paragraph>
                            <Button type="primary" onClick={() => router.visit(paths.reports.sales)}>
                                Open Sales Report
                            </Button>
                        </Card>
                    </Col>
                    <Col xs={24} md={12} xl={8}>
                        <Card title="Payment Report">
                            <Typography.Paragraph>Track receipts and payments by method, direction, and date.</Typography.Paragraph>
                            <Button type="primary" onClick={() => router.visit(paths.reports.payments)}>
                                Open Payment Report
                            </Button>
                        </Card>
                    </Col>
                    <Col xs={24} md={12} xl={8}>
                        <Card title="Inventory Report">
                            <Typography.Paragraph>Current stock, reorder levels, and stock-value snapshot.</Typography.Paragraph>
                            <Button type="primary" onClick={() => router.visit(paths.reports.inventory)}>
                                Open Inventory Report
                            </Button>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} xl={12}>
                        <Card title="Customer Ledger">
                            <Space direction="vertical" style={{ display: 'flex' }}>
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
                                <Button type="primary" disabled={!customerOption} onClick={() => customerOption && router.visit(paths.reports.customerLedger(customerOption.record.id))}>
                                    Open Customer Ledger
                                </Button>
                            </Space>
                        </Card>
                    </Col>

                    <Col xs={24} xl={12}>
                        <Card title="Supplier Ledger">
                            <Space direction="vertical" style={{ display: 'flex' }}>
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
                                <Button type="primary" disabled={!supplierOption} onClick={() => supplierOption && router.visit(paths.reports.supplierLedger(supplierOption.record.id))}>
                                    Open Supplier Ledger
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Space>
        </AppShell>
    );
}
