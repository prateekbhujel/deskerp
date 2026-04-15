import {
    AppstoreOutlined,
    BookOutlined,
    DatabaseOutlined,
    FileTextOutlined,
    FolderOpenOutlined,
    LineChartOutlined,
    SettingOutlined,
    ShopOutlined,
    SwapOutlined,
    ToolOutlined,
} from '@ant-design/icons';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { paths } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { Link, router, usePage } from '@inertiajs/react';
import { App as AntApp, Button, Layout, Space, Tag, Typography } from 'antd';
import { PropsWithChildren, ReactNode, useEffect, useMemo } from 'react';

const { Header, Sider, Content } = Layout;

interface AppShellProps extends PropsWithChildren {
    title: string;
    subtitle?: string;
    activeKey: string;
    extra?: ReactNode;
}

interface NavItem {
    key: string;
    label: string;
    href: string;
    shortcut: string;
    icon: ReactNode;
    native?: boolean;
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

    const navSections = useMemo(
        () => [
            {
                title: 'Gateway',
                items: [
                    { key: 'dashboard', label: 'Operations Desk', href: paths.dashboard, shortcut: 'Alt+D', icon: <AppstoreOutlined /> },
                    { key: 'reports', label: 'Reports Centre', href: paths.reports.index, shortcut: 'Alt+R', icon: <LineChartOutlined /> },
                ],
            },
            {
                title: 'Masters',
                items: [
                    { key: 'customers', label: 'Customers', href: paths.customers.index, shortcut: 'Alt+K', icon: <ShopOutlined />, native: true },
                    { key: 'suppliers', label: 'Suppliers', href: paths.suppliers.index, shortcut: 'Alt+U', icon: <SwapOutlined />, native: true },
                    { key: 'items', label: 'Items & Pricing', href: paths.items.index, shortcut: 'Alt+M', icon: <DatabaseOutlined /> },
                ] satisfies NavItem[],
            },
            {
                title: 'Transactions',
                items: [
                    { key: 'invoices', label: 'Sales Register', href: paths.invoices.index, shortcut: 'Alt+V', icon: <BookOutlined /> },
                    { key: 'payments', label: 'Receipts & Payments', href: paths.payments.index, shortcut: 'Alt+P', icon: <FileTextOutlined /> },
                ] satisfies NavItem[],
            },
            {
                title: 'Utilities',
                items: [
                    { key: 'settings', label: 'Fiscal & Settings', href: paths.settings, shortcut: 'Alt+S', icon: <SettingOutlined /> },
                    { key: 'backups', label: 'Backup / Restore', href: paths.backups, shortcut: 'Alt+B', icon: <ToolOutlined />, native: true },
                ] satisfies NavItem[],
            },
        ],
        [],
    );

    const todayLabel = useMemo(
        () =>
            new Intl.DateTimeFormat('en-NP', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }).format(new Date()),
        [],
    );

    useKeyboardShortcuts([
        {
            key: 'n',
            alt: true,
            allowInInputs: true,
            handler: () => router.visit(paths.invoices.create),
        },
        {
            key: 'p',
            alt: true,
            allowInInputs: true,
            handler: () => router.visit(paths.payments.createReceived),
        },
        {
            key: 'd',
            alt: true,
            handler: () => router.visit(paths.dashboard),
        },
        {
            key: 'r',
            alt: true,
            handler: () => router.visit(paths.reports.index),
        },
        {
            key: 'm',
            alt: true,
            handler: () => router.visit(paths.items.index),
        },
        {
            key: 'v',
            alt: true,
            handler: () => router.visit(paths.invoices.index),
        },
        {
            key: 's',
            alt: true,
            handler: () => router.visit(paths.settings),
        },
        {
            key: 'b',
            alt: true,
            handler: () => {
                window.location.href = paths.backups;
            },
        },
        {
            key: 'k',
            alt: true,
            handler: () => {
                window.location.href = paths.customers.index;
            },
        },
        {
            key: 'u',
            alt: true,
            handler: () => {
                window.location.href = paths.suppliers.index;
            },
        },
        {
            key: '/',
            handler: () => {
                const target = document.querySelector<HTMLInputElement>('[data-global-search="true"]');
                target?.focus();
                target?.select();
            },
        },
        {
            key: 'f',
            alt: true,
            handler: () => {
                const target = document.querySelector<HTMLInputElement>('[data-global-search="true"]');
                target?.focus();
                target?.select();
            },
        },
    ]);

    return (
        <Layout className="dp-shell" style={{ minHeight: '100vh' }}>
            <Sider width={286} breakpoint="lg" collapsedWidth={0} theme="dark" style={{ background: '#0f172a', borderRight: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <div className="px-5 py-5">
                    <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.35)]">
                        <Typography.Text style={{ color: '#94a3b8', letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 11 }}>
                            DeskERP Workspace
                        </Typography.Text>
                        <Typography.Title level={4} style={{ color: 'white', margin: '8px 0 0' }}>
                            {page.props.settings.companyName || 'DeskERP'}
                        </Typography.Title>
                        <Typography.Paragraph style={{ color: '#94a3b8', margin: '10px 0 0', fontSize: 13 }}>
                            Voucher-first accounting desk for invoicing, collections, stock, and reporting.
                        </Typography.Paragraph>
                        <Space wrap style={{ marginTop: 12 }}>
                            <Tag color="geekblue">{page.props.auth.user?.name ?? 'DeskERP'}</Tag>
                            {page.props.settings.fiscalYear.label ? <Tag color="cyan">FY {page.props.settings.fiscalYear.label}</Tag> : null}
                        </Space>
                    </div>

                    <div className="mt-4 space-y-2">
                        <Button block type="primary" size="large" onClick={() => router.visit(paths.invoices.create)}>
                            New Sales Voucher
                        </Button>
                        <Button block size="large" onClick={() => router.visit(paths.payments.createReceived)}>
                            Receipt Voucher
                        </Button>
                        <Button block onClick={() => router.visit(paths.items.create)}>
                            Item / Price Master
                        </Button>
                    </div>

                    <div className="mt-5 space-y-5">
                        {navSections.map((section) => (
                            <div key={section.title}>
                                <Typography.Text style={{ color: '#94a3b8', letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 11 }}>
                                    {section.title}
                                </Typography.Text>
                                <div className="mt-2 space-y-1.5">
                                    {section.items.map((item) => {
                                        const content = (
                                            <div
                                                className={`dp-nav-link ${activeKey === item.key ? 'dp-nav-link-active' : ''}`}
                                                data-active={activeKey === item.key ? 'true' : 'false'}
                                            >
                                                <span className="dp-nav-link__main">
                                                    <span className="dp-nav-link__icon">{item.icon}</span>
                                                    <span>{item.label}</span>
                                                </span>
                                                <span className="dp-kbd">{item.shortcut}</span>
                                            </div>
                                        );

                                        return item.native ? (
                                            <a key={item.key} href={item.href}>
                                                {content}
                                            </a>
                                        ) : (
                                            <Link key={item.key} href={item.href}>
                                                {content}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Sider>

            <Layout>
                <Header style={{ background: 'rgba(255,255,255,0.88)', padding: '12px 20px 14px', height: 'auto', lineHeight: 1.4, borderBottom: '1px solid #cbd5e1', backdropFilter: 'blur(18px)' }}>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                            <Space wrap size={[8, 8]}>
                                <Tag color="geekblue">{page.props.settings.companyName || 'DeskERP'}</Tag>
                                <Tag color={page.props.settings.displayBsDates ? 'green' : 'default'}>
                                    {page.props.settings.displayBsDates ? 'BS Display' : 'AD Display'}
                                </Tag>
                                {page.props.settings.fiscalYear.label ? <Tag color="purple">Fiscal Year {page.props.settings.fiscalYear.label}</Tag> : null}
                                <Tag color="gold">Today {todayLabel}</Tag>
                            </Space>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span className="dp-kbd">Alt+N</span>
                                <span>sales</span>
                                <span className="dp-kbd">Alt+P</span>
                                <span>receipt</span>
                                <span className="dp-kbd">Alt+V</span>
                                <span>register</span>
                                <span className="dp-kbd">/</span>
                                <span>search</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div>
                                <div data-testid="app-shell-title">
                                    <Typography.Title level={3} style={{ margin: 0 }}>
                                        {title}
                                    </Typography.Title>
                                </div>
                                {subtitle ? <Typography.Text type="secondary">{subtitle}</Typography.Text> : null}
                            </div>

                            <Space wrap size={[8, 8]}>
                                <Link href={paths.invoices.create}>
                                    <Button icon={<BookOutlined />}>Sales Voucher</Button>
                                </Link>
                                <Link href={paths.payments.createReceived}>
                                    <Button icon={<SwapOutlined />}>Receipt</Button>
                                </Link>
                                <Link href={paths.reports.index}>
                                    <Button icon={<FolderOpenOutlined />}>Books & Reports</Button>
                                </Link>
                                {extra}
                            </Space>
                        </div>
                    </div>
                </Header>

                <Content style={{ padding: 16 }}>{children}</Content>
            </Layout>
        </Layout>
    );
}
