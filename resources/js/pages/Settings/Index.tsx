import { BsDateInput } from '@/components/forms/BsDateInput';
import { AppShell } from '@/components/layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { SharedProps } from '@/types/shared';
import { useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Form, Input, Space, Switch, Tag, Typography } from 'antd';
import { useMemo } from 'react';

interface SettingsPageProps {
    settingsForm: {
        companyName: string;
        businessAddress: string;
        businessPhone: string;
        businessEmail: string;
        fiscalYearLabel: string;
        fiscalYearStartDate: string;
        fiscalYearEndDate: string;
        displayBsDates: boolean;
        invoicePrefix: string;
        paymentReceivedPrefix: string;
        paymentMadePrefix: string;
    };
}

export default function SettingsIndex({ settingsForm }: SettingsPageProps) {
    const page = usePage<SharedProps>();
    const { data, setData, patch, processing, errors } = useForm({
        company_name: settingsForm.companyName,
        business_address: settingsForm.businessAddress,
        business_phone: settingsForm.businessPhone,
        business_email: settingsForm.businessEmail,
        fiscal_year_label: settingsForm.fiscalYearLabel,
        fiscal_year_start_date: settingsForm.fiscalYearStartDate,
        fiscal_year_end_date: settingsForm.fiscalYearEndDate,
        display_bs_dates: settingsForm.displayBsDates,
        invoice_prefix: settingsForm.invoicePrefix,
        payment_received_prefix: settingsForm.paymentReceivedPrefix,
        payment_made_prefix: settingsForm.paymentMadePrefix,
    });

    const submit = () => {
        patch('/settings', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    useKeyboardShortcuts([
        {
            key: 's',
            ctrl: true,
            allowInInputs: true,
            handler: () => submit(),
        },
    ]);

    const setupChecklist = useMemo(
        () => [
            {
                label: 'Business Name',
                complete: Boolean(data.company_name.trim()),
            },
            {
                label: 'Fiscal Year Label',
                complete: Boolean(data.fiscal_year_label.trim()),
            },
            {
                label: 'Fiscal Year Date Range',
                complete: Boolean(data.fiscal_year_start_date && data.fiscal_year_end_date),
            },
            {
                label: 'Invoice Prefix',
                complete: Boolean(data.invoice_prefix.trim()),
            },
        ],
        [data.company_name, data.fiscal_year_end_date, data.fiscal_year_label, data.fiscal_year_start_date, data.invoice_prefix],
    );

    const completeCount = setupChecklist.filter((item) => item.complete).length;
    const setupComplete = completeCount === setupChecklist.length;

    return (
        <AppShell
            title="Settings"
            subtitle="Business profile, fiscal year, date display, and numbering preferences."
            activeKey="settings"
            extra={
                <Button data-testid="settings-save" type="primary" loading={processing} onClick={submit}>
                    Save Settings
                </Button>
            }
        >
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Card className="dp-dense-card">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Space wrap>
                            <Tag color={setupComplete ? 'green' : 'orange'}>
                                Setup {completeCount}/{setupChecklist.length}
                            </Tag>
                            <Tag color={page.props.settings.displayBsDates ? 'green' : 'default'}>{page.props.settings.displayBsDates ? 'BS Display Enabled' : 'AD Display'}</Tag>
                        </Space>
                        <Typography.Text type="secondary">Ctrl+S to save</Typography.Text>
                    </div>
                    {!setupComplete ? (
                        <Alert
                            style={{ marginTop: 12 }}
                            type="info"
                            showIcon
                            message="Complete required setup before regular billing."
                            description={setupChecklist.filter((item) => !item.complete).map((item) => item.label).join(', ')}
                        />
                    ) : null}
                </Card>

                <Card title="Business Profile" className="dp-dense-card">
                    <Form layout="vertical">
                        <div className="grid gap-4 xl:grid-cols-2">
                            <Form.Item label="Business Name" help={errors.company_name} validateStatus={errors.company_name ? 'error' : ''}>
                                <Input data-testid="settings-company-name" value={data.company_name} onChange={(event) => setData('company_name', event.target.value)} />
                            </Form.Item>
                            <Form.Item label="Contact Phone" help={errors.business_phone} validateStatus={errors.business_phone ? 'error' : ''}>
                                <Input value={data.business_phone} onChange={(event) => setData('business_phone', event.target.value)} />
                            </Form.Item>
                            <Form.Item label="Contact Email" help={errors.business_email} validateStatus={errors.business_email ? 'error' : ''}>
                                <Input value={data.business_email} onChange={(event) => setData('business_email', event.target.value)} />
                            </Form.Item>
                            <Form.Item label="Business Address" help={errors.business_address} validateStatus={errors.business_address ? 'error' : ''}>
                                <Input.TextArea rows={3} value={data.business_address} onChange={(event) => setData('business_address', event.target.value)} />
                            </Form.Item>
                        </div>
                    </Form>
                </Card>

                <Card title="Fiscal Year & Calendar" className="dp-dense-card">
                    <Form layout="vertical">
                        <div className="grid gap-4 xl:grid-cols-3">
                            <Form.Item label="Fiscal Year Label" help={errors.fiscal_year_label} validateStatus={errors.fiscal_year_label ? 'error' : ''}>
                                <Input data-testid="settings-fiscal-year-label" value={data.fiscal_year_label} onChange={(event) => setData('fiscal_year_label', event.target.value)} placeholder="2082/83" />
                            </Form.Item>
                            <Form.Item label="Fiscal Year Start" help={errors.fiscal_year_start_date} validateStatus={errors.fiscal_year_start_date ? 'error' : ''}>
                                <BsDateInput
                                    value={data.fiscal_year_start_date}
                                    onChange={(value) => setData('fiscal_year_start_date', value)}
                                    displayBsDates={data.display_bs_dates}
                                    placeholder="Start date"
                                />
                            </Form.Item>
                            <Form.Item label="Fiscal Year End" help={errors.fiscal_year_end_date} validateStatus={errors.fiscal_year_end_date ? 'error' : ''}>
                                <BsDateInput
                                    value={data.fiscal_year_end_date}
                                    onChange={(value) => setData('fiscal_year_end_date', value)}
                                    displayBsDates={data.display_bs_dates}
                                    placeholder="End date"
                                />
                            </Form.Item>
                        </div>

                        <Form.Item label="Display Dates in Bikram Sambat" style={{ marginBottom: 0 }}>
                            <Switch data-testid="settings-bs-switch" checked={data.display_bs_dates} onChange={(checked) => setData('display_bs_dates', checked)} />
                        </Form.Item>
                        <Typography.Text type="secondary">Dates remain stored in AD ISO format in SQLite.</Typography.Text>
                    </Form>
                </Card>

                <Card title="Voucher Number Prefixes" className="dp-dense-card">
                    <Form layout="vertical">
                        <div className="grid gap-4 xl:grid-cols-3">
                            <Form.Item label="Invoice Prefix" help={errors.invoice_prefix} validateStatus={errors.invoice_prefix ? 'error' : ''}>
                                <Input value={data.invoice_prefix} onChange={(event) => setData('invoice_prefix', event.target.value)} />
                            </Form.Item>
                            <Form.Item
                                label="Payment Received Prefix"
                                help={errors.payment_received_prefix}
                                validateStatus={errors.payment_received_prefix ? 'error' : ''}
                            >
                                <Input value={data.payment_received_prefix} onChange={(event) => setData('payment_received_prefix', event.target.value)} />
                            </Form.Item>
                            <Form.Item label="Payment Made Prefix" help={errors.payment_made_prefix} validateStatus={errors.payment_made_prefix ? 'error' : ''}>
                                <Input value={data.payment_made_prefix} onChange={(event) => setData('payment_made_prefix', event.target.value)} />
                            </Form.Item>
                        </div>
                    </Form>
                </Card>
            </Space>
        </AppShell>
    );
}
