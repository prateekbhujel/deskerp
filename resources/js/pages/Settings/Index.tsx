import { BsDateInput } from '@/components/forms/BsDateInput';
import { AppShell } from '@/components/layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { SharedProps } from '@/types/shared';
import { useForm, usePage } from '@inertiajs/react';
import { Button, Card, Form, Input, Space, Steps, Switch, Typography } from 'antd';

interface SettingsPageProps {
    settingsForm: {
        companyName: string;
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
            handler: () => submit(),
        },
    ]);

    return (
        <AppShell
            title="Settings"
            subtitle="Fiscal year, prefix numbering, and Nepali date display are managed here."
            activeKey="settings"
            extra={
                <Button type="primary" loading={processing} onClick={submit}>
                    Save Settings
                </Button>
            }
        >
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Card>
                    <Steps
                        size="small"
                        responsive
                        items={[
                            { title: 'Company' },
                            { title: 'Fiscal Year' },
                            { title: 'Display' },
                            { title: 'Numbering' },
                        ]}
                    />
                </Card>

                <Card title="Setup Wizard">
                    <Form layout="vertical">
                        <div className="grid gap-6 xl:grid-cols-2">
                            <Card size="small" title="Company">
                                <Form.Item label="Company Name" help={errors.company_name} validateStatus={errors.company_name ? 'error' : ''}>
                                    <Input value={data.company_name} onChange={(event) => setData('company_name', event.target.value)} />
                                </Form.Item>
                            </Card>

                            <Card size="small" title="Display">
                                <Form.Item label="Display dates in Bikram Sambat">
                                    <Switch checked={data.display_bs_dates} onChange={(checked) => setData('display_bs_dates', checked)} />
                                </Form.Item>
                                <Typography.Text type="secondary">
                                    Stored dates remain Gregorian ISO values in SQLite, while the UI can display BS values.
                                </Typography.Text>
                            </Card>

                            <Card size="small" title="Fiscal Year">
                                <Form.Item label="Fiscal Year Label" help={errors.fiscal_year_label} validateStatus={errors.fiscal_year_label ? 'error' : ''}>
                                    <Input value={data.fiscal_year_label} onChange={(event) => setData('fiscal_year_label', event.target.value)} placeholder="2082/83" />
                                </Form.Item>
                                <Form.Item label="Start Date" help={errors.fiscal_year_start_date} validateStatus={errors.fiscal_year_start_date ? 'error' : ''}>
                                    <BsDateInput
                                        value={data.fiscal_year_start_date}
                                        onChange={(value) => setData('fiscal_year_start_date', value)}
                                        displayBsDates={data.display_bs_dates}
                                        placeholder="Fiscal year start"
                                    />
                                </Form.Item>
                                <Form.Item label="End Date" help={errors.fiscal_year_end_date} validateStatus={errors.fiscal_year_end_date ? 'error' : ''}>
                                    <BsDateInput
                                        value={data.fiscal_year_end_date}
                                        onChange={(value) => setData('fiscal_year_end_date', value)}
                                        displayBsDates={data.display_bs_dates}
                                        placeholder="Fiscal year end"
                                    />
                                </Form.Item>
                            </Card>

                            <Card size="small" title="Prefixes">
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
                            </Card>
                        </div>
                    </Form>
                </Card>

                <Card>
                    <Typography.Text type="secondary">
                        Current display mode: {page.props.settings.displayBsDates ? 'BS' : 'AD'}.
                    </Typography.Text>
                </Card>
            </Space>
        </AppShell>
    );
}
