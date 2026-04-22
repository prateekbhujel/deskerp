import { BsDateInput } from '@/components/forms/BsDateInput';
import { AppShell } from '@/components/layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { paths } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { useForm, usePage } from '@inertiajs/react';
import { Button, Input, Select, Switch, Table } from 'antd';
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

export default function SettingsIndex({ settingsForm, users, canManageUsers }: SettingsPageProps) {
    const page = usePage<SharedProps>();

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
            { label: 'Company Name', complete: Boolean(data.company_name.trim()) },
            { label: 'Fiscal Year', complete: Boolean(data.fiscal_year_label.trim()) },
            { label: 'Fiscal Date Range', complete: Boolean(data.fiscal_year_start_date && data.fiscal_year_end_date) },
            { label: 'Invoice Prefix', complete: Boolean(data.invoice_prefix.trim()) },
        ],
        [data.company_name, data.fiscal_year_end_date, data.fiscal_year_label, data.fiscal_year_start_date, data.invoice_prefix],
    );

    const completeCount = setupChecklist.filter((item) => item.complete).length;

    useKeyboardShortcuts([
        {
            key: 's',
            ctrl: true,
            allowInInputs: true,
            handler: () => submit(),
        },
    ]);

    return (
        <AppShell title="Settings" subtitle="Company / Fiscal / Users" activeKey="settings">
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Setup Status</h3>
                    </div>
                    <div className="dp-section-body">
                        <div>Completed: {completeCount}/{setupChecklist.length}</div>
                        <div style={{ marginTop: 4 }}>Missing: {setupChecklist.filter((item) => !item.complete).map((item) => item.label).join(', ') || 'None'}</div>
                        <div style={{ marginTop: 4 }}>Ctrl+S to save settings.</div>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Company Profile</h3>
                    </div>
                    <div className="dp-form-grid">
                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Business Name</label>
                            <Input data-testid="settings-company-name" value={data.company_name} onChange={(event) => setData('company_name', event.target.value)} />
                            {errors.company_name ? <span className="dp-error-text">{errors.company_name}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Currency</label>
                            <Input value={data.currency} onChange={(event) => setData('currency', event.target.value.toUpperCase())} />
                            {errors.currency ? <span className="dp-error-text">{errors.currency}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Phone</label>
                            <Input value={data.business_phone} onChange={(event) => setData('business_phone', event.target.value)} />
                            {errors.business_phone ? <span className="dp-error-text">{errors.business_phone}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Email</label>
                            <Input value={data.business_email} onChange={(event) => setData('business_email', event.target.value)} />
                            {errors.business_email ? <span className="dp-error-text">{errors.business_email}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Address</label>
                            <Input value={data.business_address} onChange={(event) => setData('business_address', event.target.value)} />
                            {errors.business_address ? <span className="dp-error-text">{errors.business_address}</span> : null}
                        </div>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Fiscal Year</h3>
                    </div>
                    <div className="dp-form-grid">
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Fiscal Year Label</label>
                            <Input data-testid="settings-fiscal-year-label" value={data.fiscal_year_label} onChange={(event) => setData('fiscal_year_label', event.target.value)} />
                            {errors.fiscal_year_label ? <span className="dp-error-text">{errors.fiscal_year_label}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Start Date</label>
                            <BsDateInput value={data.fiscal_year_start_date} onChange={(value) => setData('fiscal_year_start_date', value)} displayBsDates={data.display_bs_dates} />
                            {errors.fiscal_year_start_date ? <span className="dp-error-text">{errors.fiscal_year_start_date}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">End Date</label>
                            <BsDateInput value={data.fiscal_year_end_date} onChange={(value) => setData('fiscal_year_end_date', value)} displayBsDates={data.display_bs_dates} />
                            {errors.fiscal_year_end_date ? <span className="dp-error-text">{errors.fiscal_year_end_date}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Display BS Dates</label>
                            <div style={{ minHeight: 30, display: 'flex', alignItems: 'center' }}>
                                <Switch data-testid="settings-bs-switch" checked={data.display_bs_dates} onChange={(checked) => setData('display_bs_dates', checked)} />
                            </div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Invoice Prefix</label>
                            <Input value={data.invoice_prefix} onChange={(event) => setData('invoice_prefix', event.target.value.toUpperCase())} />
                            {errors.invoice_prefix ? <span className="dp-error-text">{errors.invoice_prefix}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Payment Prefix</label>
                            <Input value={data.payment_received_prefix} onChange={(event) => setData('payment_received_prefix', event.target.value.toUpperCase())} />
                            {errors.payment_received_prefix ? <span className="dp-error-text">{errors.payment_received_prefix}</span> : null}
                        </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <Button data-testid="settings-save" type="primary" loading={processing} onClick={submit}>
                            Save Settings
                        </Button>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Users</h3>
                    </div>
                    <Table
                        rowKey="id"
                        size="small"
                        pagination={false}
                        dataSource={users}
                        columns={[
                            { title: 'Name', dataIndex: 'name' },
                            { title: 'Username', dataIndex: 'username' },
                            { title: 'Role', dataIndex: 'role' },
                            { title: 'Status', render: (_, record) => (record.is_active ? 'Active' : 'Inactive') },
                            { title: 'Last Login', dataIndex: 'last_login_at', render: (value) => value || '-' },
                            {
                                title: 'Action',
                                render: (_, record) =>
                                    canManageUsers ? (
                                        <Button
                                            onClick={() => {
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

                {canManageUsers ? (
                    <>
                        <section className="dp-section-block">
                            <div className="dp-section-head">
                                <h3 className="dp-section-title">Add User</h3>
                            </div>
                            <div className="dp-form-grid">
                                <div className="dp-field col-span-12 xl:col-span-2">
                                    <label className="dp-field-label">Name</label>
                                    <Input value={createUserData.name} onChange={(event) => setCreateUserData('name', event.target.value)} />
                                    {createUserErrors.name ? <span className="dp-error-text">{createUserErrors.name}</span> : null}
                                </div>
                                <div className="dp-field col-span-12 xl:col-span-2">
                                    <label className="dp-field-label">Username</label>
                                    <Input value={createUserData.username} onChange={(event) => setCreateUserData('username', event.target.value)} />
                                    {createUserErrors.username ? <span className="dp-error-text">{createUserErrors.username}</span> : null}
                                </div>
                                <div className="dp-field col-span-12 xl:col-span-2">
                                    <label className="dp-field-label">Role</label>
                                    <Select
                                        value={createUserData.role}
                                        onChange={(value) => setCreateUserData('role', value)}
                                        options={[
                                            { value: 'admin', label: 'Admin' },
                                            { value: 'data_entry', label: 'Data Entry' },
                                            { value: 'view_only', label: 'View Only' },
                                        ]}
                                    />
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
                                    <div style={{ minHeight: 30, display: 'flex', alignItems: 'center' }}>
                                        <Switch checked={createUserData.is_active} onChange={(checked) => setCreateUserData('is_active', checked)} />
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: 8 }}>
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
                                    <div className="dp-field col-span-12 xl:col-span-3">
                                        <label className="dp-field-label">Name</label>
                                        <Input value={editUserData.name} onChange={(event) => setEditUserData('name', event.target.value)} />
                                        {editUserErrors.name ? <span className="dp-error-text">{editUserErrors.name}</span> : null}
                                    </div>
                                    <div className="dp-field col-span-12 xl:col-span-2">
                                        <label className="dp-field-label">Role</label>
                                        <Select
                                            value={editUserData.role}
                                            onChange={(value) => setEditUserData('role', value)}
                                            options={[
                                                { value: 'admin', label: 'Admin' },
                                                { value: 'data_entry', label: 'Data Entry' },
                                                { value: 'view_only', label: 'View Only' },
                                            ]}
                                        />
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
                                        <div style={{ minHeight: 30, display: 'flex', alignItems: 'center' }}>
                                            <Switch checked={editUserData.is_active} onChange={(checked) => setEditUserData('is_active', checked)} />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 8 }}>
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
                                    </Button>{' '}
                                    <Button onClick={() => setEditingUserId(null)}>Cancel</Button>
                                </div>
                            </section>
                        ) : null}
                    </>
                ) : (
                    <section className="dp-section-block">
                        <div className="dp-empty-state">Only admin can add or edit users.</div>
                    </section>
                )}
            </div>
        </AppShell>
    );
}
