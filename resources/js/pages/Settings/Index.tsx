import { BsDateInput } from '@/components/forms/BsDateInput';
import { AppShell } from '@/components/layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePlatformShortcuts } from '@/hooks/usePlatformShortcuts';
import { paths } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { useForm, usePage } from '@inertiajs/react';
import { Button, Input, Select, Switch, Table, Tabs } from 'antd';
import { useMemo, useState } from 'react';

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
        currency: string;
    };
    users: Array<{
        id: number;
        name: string;
        username: string;
        role: string;
        is_active: boolean;
        last_login_at: string | null;
    }>;
    canManageUsers: boolean;
}

const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'data_entry', label: 'Data Entry' },
    { value: 'view_only', label: 'View Only' },
] as const;

const roleGuides = [
    {
        key: 'admin',
        label: 'Admin',
        detail: 'Manage company settings, users, masters, vouchers, reports, and backup restore.',
    },
    {
        key: 'data_entry',
        label: 'Data Entry',
        detail: 'Create and edit masters, invoices, and payments. No voucher deletion or system setup.',
    },
    {
        key: 'view_only',
        label: 'View Only',
        detail: 'Read registers and reports only. No create, edit, restore, or settings access.',
    },
];

function formatRole(role: string) {
    return role.replace('_', ' ');
}

export default function SettingsIndex({ settingsForm, users, canManageUsers }: SettingsPageProps) {
    const page = usePage<SharedProps>();
    const { isMac } = usePlatformShortcuts();
    const [activeTab, setActiveTab] = useState('company');

    const {
        data,
        setData,
        patch,
        processing,
        errors,
    } = useForm({
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
        currency: settingsForm.currency || 'NPR',
    });

    const {
        data: createUserData,
        setData: setCreateUserData,
        post: postUser,
        processing: creatingUser,
        errors: createUserErrors,
        reset: resetCreateUser,
    } = useForm({
        name: '',
        username: '',
        role: 'data_entry',
        password: '',
        password_confirmation: '',
        is_active: true,
    });

    const {
        data: editUserData,
        setData: setEditUserData,
        patch: patchUser,
        processing: updatingUser,
        errors: editUserErrors,
        reset: resetEditUser,
    } = useForm({
        name: '',
        role: 'data_entry',
        password: '',
        password_confirmation: '',
        is_active: true,
    });

    const [editingUserId, setEditingUserId] = useState<number | null>(null);

    const submit = () => {
        patch(paths.settings, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const setupChecklist = useMemo(
        () => [
            { label: 'Business Name', complete: Boolean(data.company_name.trim()) },
            { label: 'Fiscal Year Label', complete: Boolean(data.fiscal_year_label.trim()) },
            { label: 'Fiscal Date Range', complete: Boolean(data.fiscal_year_start_date && data.fiscal_year_end_date) },
            { label: 'Invoice Prefix', complete: Boolean(data.invoice_prefix.trim()) },
            { label: 'Payment Prefixes', complete: Boolean(data.payment_received_prefix.trim() && data.payment_made_prefix.trim()) },
        ],
        [data.company_name, data.fiscal_year_end_date, data.fiscal_year_label, data.fiscal_year_start_date, data.invoice_prefix, data.payment_made_prefix, data.payment_received_prefix],
    );

    const missingChecklist = setupChecklist.filter((item) => !item.complete).map((item) => item.label);

    useKeyboardShortcuts([
        {
            key: 's',
            ctrl: !isMac,
            meta: isMac,
            allowInInputs: true,
            handler: () => submit(),
        },
    ]);

    return (
        <AppShell
            title="Settings"
            subtitle="Company, fiscal year, numbering, and user access"
            activeKey="settings"
            extra={
                <Button data-testid="settings-save" type="primary" loading={processing} onClick={submit}>
                    Save Changes
                </Button>
            }
        >
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Setup Summary</h3>
                    </div>
                    <div className="dp-settings-summary-grid">
                        <div>
                            <div className="dp-kicker">Company</div>
                            <strong>{data.company_name || 'Not set'}</strong>
                        </div>
                        <div>
                            <div className="dp-kicker">Fiscal Year</div>
                            <strong>{data.fiscal_year_label || 'Not set'}</strong>
                        </div>
                        <div>
                            <div className="dp-kicker">Calendar</div>
                            <strong>{data.display_bs_dates ? 'Bikram Sambat display' : 'Gregorian display'}</strong>
                        </div>
                        <div>
                            <div className="dp-kicker">Build</div>
                            <strong>v{page.props.appVersion}</strong>
                        </div>
                    </div>
                    <div className="dp-inline-meta" style={{ marginTop: 12 }}>
                        {missingChecklist.length ? `Pending setup: ${missingChecklist.join(', ')}` : 'Core setup is complete.'}
                    </div>
                </section>

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'company',
                            label: 'Company',
                            children: (
                                <div className="dp-form-page dp-tab-panel">
                                    <section className="dp-section-block">
                                        <div className="dp-section-head">
                                            <h3 className="dp-section-title">Business Profile</h3>
                                        </div>
                                        <div className="dp-form-grid">
                                            <div className="dp-field col-span-12 xl:col-span-4">
                                                <label className="dp-field-label">Business Name</label>
                                                <Input data-testid="settings-company-name" value={data.company_name} onChange={(event) => setData('company_name', event.target.value)} />
                                                {errors.company_name ? <span className="dp-error-text">{errors.company_name}</span> : null}
                                            </div>
                                            <div className="dp-field col-span-12 xl:col-span-2">
                                                <label className="dp-field-label">Currency</label>
                                                <Input value={data.currency} onChange={(event) => setData('currency', event.target.value.toUpperCase())} />
                                                {errors.currency ? <span className="dp-error-text">{errors.currency}</span> : null}
                                            </div>
                                            <div className="dp-field col-span-12 xl:col-span-3">
                                                <label className="dp-field-label">Phone</label>
                                                <Input value={data.business_phone} onChange={(event) => setData('business_phone', event.target.value)} />
                                                {errors.business_phone ? <span className="dp-error-text">{errors.business_phone}</span> : null}
                                            </div>
                                            <div className="dp-field col-span-12 xl:col-span-3">
                                                <label className="dp-field-label">Email</label>
                                                <Input value={data.business_email} onChange={(event) => setData('business_email', event.target.value)} />
                                                {errors.business_email ? <span className="dp-error-text">{errors.business_email}</span> : null}
                                            </div>
                                            <div className="dp-field col-span-12">
                                                <label className="dp-field-label">Business Address</label>
                                                <Input.TextArea rows={3} value={data.business_address} onChange={(event) => setData('business_address', event.target.value)} />
                                                {errors.business_address ? <span className="dp-error-text">{errors.business_address}</span> : null}
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            ),
                        },
                        {
                            key: 'fiscal',
                            label: 'Fiscal & Numbering',
                            children: (
                                <div className="dp-form-page dp-tab-panel">
                                    <section className="dp-section-block">
                                        <div className="dp-section-head">
                                            <h3 className="dp-section-title">Fiscal Year</h3>
                                        </div>
                                        <div className="dp-form-grid">
                                            <div className="dp-field col-span-12 xl:col-span-3">
                                                <label className="dp-field-label">Fiscal Year Label</label>
                                                <Input data-testid="settings-fiscal-year-label" value={data.fiscal_year_label} onChange={(event) => setData('fiscal_year_label', event.target.value)} />
                                                {errors.fiscal_year_label ? <span className="dp-error-text">{errors.fiscal_year_label}</span> : null}
                                            </div>
                                            <div className="dp-field col-span-12 xl:col-span-3">
                                                <label className="dp-field-label">Start Date</label>
                                                <BsDateInput value={data.fiscal_year_start_date} onChange={(value) => setData('fiscal_year_start_date', value)} displayBsDates={data.display_bs_dates} />
                                                {errors.fiscal_year_start_date ? <span className="dp-error-text">{errors.fiscal_year_start_date}</span> : null}
                                            </div>
                                            <div className="dp-field col-span-12 xl:col-span-3">
                                                <label className="dp-field-label">End Date</label>
                                                <BsDateInput value={data.fiscal_year_end_date} onChange={(value) => setData('fiscal_year_end_date', value)} displayBsDates={data.display_bs_dates} />
                                                {errors.fiscal_year_end_date ? <span className="dp-error-text">{errors.fiscal_year_end_date}</span> : null}
                                            </div>
                                            <div className="dp-field col-span-12 xl:col-span-3">
                                                <label className="dp-field-label">Display BS Dates</label>
                                                <div className="dp-switch-row">
                                                    <Switch data-testid="settings-bs-switch" checked={data.display_bs_dates} onChange={(checked) => setData('display_bs_dates', checked)} />
                                                    <span>{data.display_bs_dates ? 'Enabled' : 'Disabled'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="dp-section-block">
                                        <div className="dp-section-head">
                                            <h3 className="dp-section-title">Voucher Numbering</h3>
                                        </div>
                                        <div className="dp-form-grid">
                                            <div className="dp-field col-span-12 xl:col-span-4">
                                                <label className="dp-field-label">Invoice Prefix</label>
                                                <Input value={data.invoice_prefix} onChange={(event) => setData('invoice_prefix', event.target.value.toUpperCase())} />
                                                {errors.invoice_prefix ? <span className="dp-error-text">{errors.invoice_prefix}</span> : null}
                                            </div>
                                            <div className="dp-field col-span-12 xl:col-span-4">
                                                <label className="dp-field-label">Receipt Prefix</label>
                                                <Input value={data.payment_received_prefix} onChange={(event) => setData('payment_received_prefix', event.target.value.toUpperCase())} />
                                                {errors.payment_received_prefix ? <span className="dp-error-text">{errors.payment_received_prefix}</span> : null}
                                            </div>
                                            <div className="dp-field col-span-12 xl:col-span-4">
                                                <label className="dp-field-label">Payment Prefix</label>
                                                <Input value={data.payment_made_prefix} onChange={(event) => setData('payment_made_prefix', event.target.value.toUpperCase())} />
                                                {errors.payment_made_prefix ? <span className="dp-error-text">{errors.payment_made_prefix}</span> : null}
                                            </div>
                                        </div>
                                        <div className="dp-inline-meta" style={{ marginTop: 12 }}>
                                            New voucher numbers follow the current fiscal year label and the active prefixes. Existing voucher numbers stay unchanged.
                                        </div>
                                    </section>
                                </div>
                            ),
                        },
                        {
                            key: 'users',
                            label: 'Users & Access',
                            children: (
                                <div className="dp-form-page dp-tab-panel">
                                    <section className="dp-section-block">
                                        <div className="dp-section-head">
                                            <h3 className="dp-section-title">User Accounts</h3>
                                        </div>
                                        <Table
                                            rowKey="id"
                                            size="small"
                                            pagination={false}
                                            dataSource={users}
                                            locale={{ emptyText: 'No user accounts found.' }}
                                            columns={[
                                                { title: 'Name', dataIndex: 'name' },
                                                { title: 'Username', dataIndex: 'username' },
                                                { title: 'Role', render: (_, record) => formatRole(record.role) },
                                                { title: 'Status', render: (_, record) => (record.is_active ? 'Active' : 'Inactive') },
                                                { title: 'Last Login', dataIndex: 'last_login_at', render: (value) => value || '-' },
                                                {
                                                    title: 'Action',
                                                    width: 96,
                                                    render: (_, record) =>
                                                        canManageUsers ? (
                                                            <Button
                                                                onClick={() => {
                                                                    setActiveTab('users');
                                                                    setEditingUserId(record.id);
                                                                    setEditUserData({
                                                                        name: record.name,
                                                                        role: record.role,
                                                                        password: '',
                                                                        password_confirmation: '',
                                                                        is_active: record.is_active,
                                                                    });
                                                                }}
                                                            >
                                                                Edit
                                                            </Button>
                                                        ) : (
                                                            '-'
                                                        ),
                                                },
                                            ]}
                                        />
                                    </section>

                                    <section className="dp-section-block">
                                        <div className="dp-section-head">
                                            <h3 className="dp-section-title">Role Access</h3>
                                        </div>
                                        <ul className="dp-section-list">
                                            {roleGuides.map((guide) => (
                                                <li key={guide.key}>
                                                    <div>
                                                        <strong>{guide.label}</strong>
                                                        <div className="dp-inline-meta">{guide.detail}</div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>

                                    {canManageUsers ? (
                                        <>
                                            <section className="dp-section-block">
                                                <div className="dp-section-head">
                                                    <h3 className="dp-section-title">Add User</h3>
                                                </div>
                                                <div className="dp-form-grid">
                                                    <div className="dp-field col-span-12 xl:col-span-3">
                                                        <label className="dp-field-label">Name</label>
                                                        <Input value={createUserData.name} onChange={(event) => setCreateUserData('name', event.target.value)} />
                                                        {createUserErrors.name ? <span className="dp-error-text">{createUserErrors.name}</span> : null}
                                                    </div>
                                                    <div className="dp-field col-span-12 xl:col-span-3">
                                                        <label className="dp-field-label">Username</label>
                                                        <Input value={createUserData.username} onChange={(event) => setCreateUserData('username', event.target.value)} />
                                                        {createUserErrors.username ? <span className="dp-error-text">{createUserErrors.username}</span> : null}
                                                    </div>
                                                    <div className="dp-field col-span-12 xl:col-span-2">
                                                        <label className="dp-field-label">Role</label>
                                                        <Select value={createUserData.role} onChange={(value) => setCreateUserData('role', value)} options={[...roleOptions]} />
                                                    </div>
                                                    <div className="dp-field col-span-12 xl:col-span-2">
                                                        <label className="dp-field-label">Password</label>
                                                        <Input.Password value={createUserData.password} onChange={(event) => setCreateUserData('password', event.target.value)} />
                                                        {createUserErrors.password ? <span className="dp-error-text">{createUserErrors.password}</span> : null}
                                                    </div>
                                                    <div className="dp-field col-span-12 xl:col-span-2">
                                                        <label className="dp-field-label">Confirm Password</label>
                                                        <Input.Password value={createUserData.password_confirmation} onChange={(event) => setCreateUserData('password_confirmation', event.target.value)} />
                                                    </div>
                                                    <div className="dp-field col-span-12 xl:col-span-2">
                                                        <label className="dp-field-label">Active</label>
                                                        <div className="dp-switch-row">
                                                            <Switch checked={createUserData.is_active} onChange={(checked) => setCreateUserData('is_active', checked)} />
                                                            <span>{createUserData.is_active ? 'Active' : 'Inactive'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="dp-action-row">
                                                    <Button
                                                        type="primary"
                                                        loading={creatingUser}
                                                        onClick={() =>
                                                            postUser(paths.settingsUsers, {
                                                                preserveScroll: true,
                                                                onSuccess: () => resetCreateUser('name', 'username', 'password', 'password_confirmation'),
                                                            })
                                                        }
                                                    >
                                                        Create User
                                                    </Button>
                                                </div>
                                            </section>

                                            {editingUserId ? (
                                                <section className="dp-section-block">
                                                    <div className="dp-section-head">
                                                        <h3 className="dp-section-title">Edit User</h3>
                                                    </div>
                                                    <div className="dp-form-grid">
                                                        <div className="dp-field col-span-12 xl:col-span-4">
                                                            <label className="dp-field-label">Name</label>
                                                            <Input value={editUserData.name} onChange={(event) => setEditUserData('name', event.target.value)} />
                                                            {editUserErrors.name ? <span className="dp-error-text">{editUserErrors.name}</span> : null}
                                                        </div>
                                                        <div className="dp-field col-span-12 xl:col-span-3">
                                                            <label className="dp-field-label">Role</label>
                                                            <Select value={editUserData.role} onChange={(value) => setEditUserData('role', value)} options={[...roleOptions]} />
                                                        </div>
                                                        <div className="dp-field col-span-12 xl:col-span-2">
                                                            <label className="dp-field-label">New Password</label>
                                                            <Input.Password value={editUserData.password} onChange={(event) => setEditUserData('password', event.target.value)} />
                                                            {editUserErrors.password ? <span className="dp-error-text">{editUserErrors.password}</span> : null}
                                                        </div>
                                                        <div className="dp-field col-span-12 xl:col-span-2">
                                                            <label className="dp-field-label">Confirm Password</label>
                                                            <Input.Password value={editUserData.password_confirmation} onChange={(event) => setEditUserData('password_confirmation', event.target.value)} />
                                                        </div>
                                                        <div className="dp-field col-span-12 xl:col-span-1">
                                                            <label className="dp-field-label">Active</label>
                                                            <div className="dp-switch-row">
                                                                <Switch checked={editUserData.is_active} onChange={(checked) => setEditUserData('is_active', checked)} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="dp-action-row">
                                                        <Button
                                                            type="primary"
                                                            loading={updatingUser}
                                                            onClick={() =>
                                                                patchUser(paths.settingsUserUpdate(editingUserId), {
                                                                    preserveScroll: true,
                                                                })
                                                            }
                                                        >
                                                            Update User
                                                        </Button>
                                                        <Button
                                                            onClick={() => {
                                                                setEditingUserId(null);
                                                                resetEditUser();
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </section>
                                            ) : null}
                                        </>
                                    ) : (
                                        <section className="dp-section-block">
                                            <div className="dp-empty-state">Only admin can create or change user accounts.</div>
                                        </section>
                                    )}
                                </div>
                            ),
                        },
                    ]}
                />
            </div>
        </AppShell>
    );
}
