import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { paths } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { Link, router, usePage } from '@inertiajs/react';
import { App as AntApp, Button, Layout, Menu, Space, Tag, Typography } from 'antd';
import { PropsWithChildren, ReactNode, useEffect, useMemo } from 'react';

const { Header, Sider, Content } = Layout;

interface AppShellProps extends PropsWithChildren {
    title: string;
    subtitle?: string;
    activeKey: string;
    extra?: ReactNode;
}

export function AppShell({ title, subtitle, activeKey, extra, children }: AppShellProps) {
    const page = usePage<SharedProps>();
    const { message } = AntApp.useApp();

    useEffect(() => {
        if (page.props.flash.success) {
            message.success(page.props.flash.success);
        }

        if (page.props.flash.error) {
            message.error(page.props.flash.error);
        }
    }, [message, page.props.flash.error, page.props.flash.success]);

    const menuItems = useMemo(
        () => [
            { key: 'dashboard', label: <Link href={paths.dashboard}>Dashboard</Link> },
            { key: 'customers', label: <a href={paths.customers.index}>Customers</a> },
            { key: 'suppliers', label: <a href={paths.suppliers.index}>Suppliers</a> },
            { key: 'items', label: <Link href={paths.items.index}>Items</Link> },
            { key: 'invoices', label: <Link href={paths.invoices.index}>Invoices</Link> },
            { key: 'payments', label: <Link href={paths.payments.index}>Payments</Link> },
            { key: 'reports', label: <Link href={paths.reports.index}>Reports</Link> },
            { key: 'settings', label: <Link href={paths.settings}>Settings</Link> },
            { key: 'backups', label: <a href={paths.backups}>Backup / Restore</a> },
        ],
        [],
    );

    useKeyboardShortcuts([
        {
            key: 'n',
            alt: true,
            handler: () => router.visit(paths.invoices.create),
        },
        {
            key: 'p',
            alt: true,
            handler: () => router.visit(paths.payments.createReceived),
        },
        {
            key: 'g',
            alt: true,
            handler: () => router.visit(paths.reports.index),
        },
        {
            key: 'f',
            alt: true,
            handler: () => {
                const target = document.querySelector<HTMLInputElement>('[data-global-search="true"]');
                target?.focus();
            },
        },
    ]);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={240} breakpoint="lg" collapsedWidth={0} theme="dark">
                <div className="border-b border-slate-800 px-5 py-4">
                    <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
                        DeskERP
                    </Typography.Title>
                    <Typography.Text style={{ color: '#94a3b8' }}>React Accounting Workspace</Typography.Text>
                </div>

                <div className="px-4 py-4">
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Button block type="primary" onClick={() => router.visit(paths.invoices.create)}>
                            New Invoice
                        </Button>
                        <Button block onClick={() => router.visit(paths.payments.createReceived)}>
                            New Payment
                        </Button>
                        <Menu theme="dark" mode="inline" selectedKeys={[activeKey]} items={menuItems} />
                    </Space>
                </div>
            </Sider>

            <Layout>
                <Header style={{ background: '#fff', padding: '16px 24px', height: 'auto', lineHeight: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <Typography.Title level={3} style={{ margin: 0 }}>
                                {title}
                            </Typography.Title>
                            {subtitle ? <Typography.Text type="secondary">{subtitle}</Typography.Text> : null}
                            <Space size={8} style={{ display: 'flex', marginTop: 12, flexWrap: 'wrap' }}>
                                <Tag color="geekblue">{page.props.auth.user?.name ?? 'DeskERP'}</Tag>
                                <Tag color={page.props.settings.displayBsDates ? 'green' : 'default'}>
                                    {page.props.settings.displayBsDates ? 'BS Display' : 'AD Display'}
                                </Tag>
                                {page.props.settings.fiscalYear.label ? <Tag color="purple">FY {page.props.settings.fiscalYear.label}</Tag> : null}
                            </Space>
                        </div>

                        <Space wrap>
                            <Typography.Text type="secondary">Alt+F focuses the active page search.</Typography.Text>
                            {extra}
                        </Space>
                    </div>
                </Header>

                <Content style={{ padding: 24 }}>{children}</Content>
            </Layout>
        </Layout>
    );
}
