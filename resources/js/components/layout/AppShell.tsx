import {
    AppstoreOutlined,
    BookOutlined,
    DatabaseOutlined,
    FileTextOutlined,
    LineChartOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined,
    ShopOutlined,
    SwapOutlined,
    ToolOutlined,
} from '@ant-design/icons';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePlatformShortcuts } from '@/hooks/usePlatformShortcuts';
import { paths, withQuery } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { Link, router, usePage } from '@inertiajs/react';
import { Button, Input, Layout, Space, Typography } from 'antd';
import { PropsWithChildren, ReactNode, useMemo, useState } from 'react';

const { Header, Sider, Content } = Layout;

interface AppShellProps extends PropsWithChildren {
    title: string;
    subtitle?: string;
    activeKey: string;
    extra?: ReactNode;
    mode?: string;
}

interface NavItem {
    key: string;
    label: string;
    href: string;
    shortcut: string;
    icon: ReactNode;
    native?: boolean;
}

export function AppShell({ title, subtitle, activeKey, extra, children, mode }: AppShellProps) {
    const page = usePage<SharedProps>();
    const { isMac, shortcuts } = usePlatformShortcuts();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [invoiceSearch, setInvoiceSearch] = useState('');

    const altLabel = (key: string) => (isMac ? `⌥${key.toUpperCase()}` : `Alt+${key.toUpperCase()}`);

    const navSections = useMemo(
        () =>
            [
                {
                    title: 'Workspace',
                    items: [
                        { key: 'dashboard', label: 'Dashboard', href: paths.dashboard, shortcut: altLabel('d'), icon: <AppstoreOutlined /> },
                        { key: 'reports', label: 'Reports', href: paths.reports.index, shortcut: shortcuts.reports, icon: <LineChartOutlined /> },
                    ],
                },
                {
                    title: 'Masters',
                    items: [
                        { key: 'customers', label: 'Customers', href: paths.customers.index, shortcut: altLabel('k'), icon: <ShopOutlined />, native: true },
                        { key: 'suppliers', label: 'Suppliers', href: paths.suppliers.index, shortcut: altLabel('u'), icon: <SwapOutlined />, native: true },
                        { key: 'items', label: 'Inventory & Pricing', href: paths.items.index, shortcut: altLabel('m'), icon: <DatabaseOutlined /> },
                    ] satisfies NavItem[],
                },
                {
                    title: 'Transactions',
                    items: [
                        { key: 'invoices', label: 'Invoices', href: paths.invoices.index, shortcut: shortcuts.searchInvoice, icon: <BookOutlined /> },
                        { key: 'payments', label: 'Payments', href: paths.payments.index, shortcut: shortcuts.newPayment, icon: <FileTextOutlined /> },
                    ] satisfies NavItem[],
                },
                {
                    title: 'System',
                    items: [
                        { key: 'settings', label: 'Settings', href: paths.settings, shortcut: altLabel('s'), icon: <SettingOutlined /> },
                        { key: 'backups', label: 'Backup / Restore', href: paths.backups, shortcut: altLabel('b'), icon: <ToolOutlined /> },
                    ] satisfies NavItem[],
                },
            ] as Array<{ title: string; items: NavItem[] }>,
        [isMac, shortcuts.newPayment, shortcuts.reports, shortcuts.searchInvoice],
    );

    const currentMode = mode ?? 'Posted';
    const fiscalLabel = page.props.settings.fiscalYear.label ? `FY ${page.props.settings.fiscalYear.label}` : 'FY Not Set';

    const submitInvoiceSearch = () => {
        router.visit(withQuery(paths.invoices.index, { q: invoiceSearch }), {
            preserveState: false,
            preserveScroll: true,
        });
    };

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
                router.visit(paths.backups);
            },
        },
        {
            key: '\\',
            alt: true,
            allowInInputs: true,
            handler: () => setSidebarCollapsed((current) => !current),
        },
        {
            key: 'k',
            alt: true,
            allowInInputs: true,
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
            key: 'i',
            alt: true,
            allowInInputs: true,
            handler: () => {
                if (document.querySelector('[data-shortcut-scope="voucher"]')) {
                    return;
                }

                const target = document.querySelector<HTMLInputElement>('[data-global-search="true"]');
                target?.focus();
                target?.select();
            },
        },
        {
            key: '/',
            allowInInputs: true,
            handler: () => {
                const target = document.querySelector<HTMLInputElement>('[data-global-search="true"]');
                target?.focus();
                target?.select();
            },
        },
    ]);

    return (
        <Layout className="dp-shell" style={{ minHeight: '100vh' }}>
            <Sider width={238} collapsed={sidebarCollapsed} collapsedWidth={54} theme="dark" trigger={null} style={{ background: '#0b1020' }}>
                <div className="dp-sidebar">
                    <div className="dp-sidebar-brand">
                        {!sidebarCollapsed ? (
                            <>
                                <Typography.Text style={{ color: '#94a3b8', letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 11 }}>
                                    DeskERP
                                </Typography.Text>
                                <Typography.Title level={5} style={{ color: 'white', margin: '4px 0 0' }}>
                                    {page.props.settings.companyName || 'DeskERP'}
                                </Typography.Title>
                            </>
                        ) : (
                            <Typography.Text style={{ color: 'white', fontWeight: 700 }}>DP</Typography.Text>
                        )}
                    </div>

                    {!sidebarCollapsed ? (
                        <div className="dp-sidebar-quick">
                            <Button size="small" type="primary" onClick={() => router.visit(paths.invoices.create)}>
                                New Invoice <span className="dp-kbd">{shortcuts.newInvoice}</span>
                            </Button>
                            <Button size="small" onClick={() => router.visit(paths.payments.createReceived)}>
                                Payment <span className="dp-kbd">{shortcuts.newPayment}</span>
                            </Button>
                        </div>
                    ) : null}

                    <div className="mt-2 space-y-4">
                        {navSections.map((section) => (
                            <div key={section.title}>
                                {!sidebarCollapsed ? (
                                    <Typography.Text style={{ color: '#64748b', letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 10 }}>
                                        {section.title}
                                    </Typography.Text>
                                ) : null}
                                <div className={sidebarCollapsed ? 'mt-1 space-y-1' : 'mt-1.5 space-y-1'}>
                                    {section.items.map((item) => {
                                        const content = (
                                            <div className={`dp-nav-link ${activeKey === item.key ? 'dp-nav-link-active' : ''}`} data-active={activeKey === item.key ? 'true' : 'false'}>
                                                <span className="dp-nav-link__main">
                                                    <span className="dp-nav-link__icon">{item.icon}</span>
                                                    {!sidebarCollapsed ? <span>{item.label}</span> : null}
                                                </span>
                                                {!sidebarCollapsed ? <span className="dp-kbd">{item.shortcut}</span> : null}
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

                    <div className="dp-sidebar-footer">
                        {!sidebarCollapsed ? (
                            <Typography.Text style={{ color: '#94a3b8', fontSize: 11 }}>
                                {fiscalLabel} | {page.props.auth.user?.name ?? 'Admin'}
                            </Typography.Text>
                        ) : null}
                    </div>
                </div>
            </Sider>

            <Layout>
                <Header className="dp-topbar">
                    <div className="dp-topbar-row">
                        <div className="dp-topbar-left">
                            <Button size="small" onClick={() => setSidebarCollapsed((current) => !current)}>
                                {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            </Button>
                            <Space size={6} wrap>
                                <Button size="small" type="primary" onClick={() => router.visit(paths.invoices.create)}>
                                    Invoice <span className="dp-kbd">{shortcuts.newInvoice}</span>
                                </Button>
                                <Button size="small" onClick={() => router.visit(paths.payments.createReceived)}>
                                    Payment <span className="dp-kbd">{shortcuts.newPayment}</span>
                                </Button>
                                <Button size="small" onClick={() => router.visit(paths.reports.index)}>
                                    Reports <span className="dp-kbd">{shortcuts.reports}</span>
                                </Button>
                            </Space>
                        </div>

                        <div className="dp-topbar-search">
                            <Input
                                size="small"
                                data-global-search="true"
                                value={invoiceSearch}
                                onChange={(event) => setInvoiceSearch(event.target.value)}
                                onPressEnter={submitInvoiceSearch}
                                placeholder={`Search invoice (${shortcuts.searchInvoice})`}
                            />
                        </div>
                    </div>

                    <div className="dp-topbar-row">
                        <div>
                            <div data-testid="app-shell-title">
                                <Typography.Title level={4} style={{ margin: 0 }}>
                                    {title}
                                </Typography.Title>
                            </div>
                            {subtitle ? <Typography.Text type="secondary">{subtitle}</Typography.Text> : null}
                        </div>
                        {extra ? <Space wrap size={[6, 6]}>{extra}</Space> : null}
                    </div>
                </Header>

                <Content className="dp-content">
                    {page.props.flash.success ? (
                        <div className="dp-inline-message dp-inline-message-success">{page.props.flash.success}</div>
                    ) : null}
                    {page.props.flash.error ? (
                        <div className="dp-inline-message dp-inline-message-error">{page.props.flash.error}</div>
                    ) : null}
                    {children}
                </Content>

                <div className="dp-status-bar">
                    <span>{fiscalLabel}</span>
                    <span>|</span>
                    <span>{page.props.auth.user?.name ?? 'Admin'}</span>
                    <span>|</span>
                    <span>{currentMode}</span>
                    <span>|</span>
                    <span>{shortcuts.toggleSidebar} Sidebar</span>
                </div>
            </Layout>
        </Layout>
    );
}
