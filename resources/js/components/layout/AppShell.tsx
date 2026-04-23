import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { paths, withQuery } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { router, usePage } from '@inertiajs/react';
import { Button, Dropdown, Input, Layout } from 'antd';
import type { MenuProps } from 'antd';
import { PropsWithChildren, ReactNode, useEffect, useMemo, useRef, useState } from 'react';

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
}

interface NavSection {
    title: string;
    items: NavItem[];
}

function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    return Boolean(target.closest('input, textarea, select, [contenteditable="true"], .ant-select-dropdown, .ant-picker-dropdown'));
}

function formatRole(role?: string | null) {
    return (role ?? 'admin').replace('_', ' ');
}

export function AppShell({ title, subtitle, activeKey, extra, children, mode }: AppShellProps) {
    const page = usePage<SharedProps>();
    const [sidebarHidden, setSidebarHidden] = useState(false);
    const [invoiceSearch, setInvoiceSearch] = useState('');
    const navRefs = useRef<Array<HTMLElement | null>>([]);
    const isViewOnly = page.props.auth.user?.role === 'view_only';
    const companyName = page.props.settings.companyName?.trim() || 'DeskERP';

    const navSections = useMemo<NavSection[]>(
        () => [
            {
                title: 'Transactions',
                items: [
                    { key: 'new-invoice', label: 'Sales Voucher', href: paths.invoices.create },
                    { key: 'new-receipt', label: 'Receive Payment', href: paths.payments.createReceived },
                    { key: 'new-payment', label: 'Make Payment', href: paths.payments.createMade },
                    { key: 'invoices', label: 'Invoices Register', href: paths.invoices.index },
                    { key: 'payments', label: 'Payments Register', href: paths.payments.index },
                ],
            },
            {
                title: 'Masters',
                items: [
                    { key: 'items', label: 'Items & Pricing', href: paths.items.index },
                    { key: 'customers', label: 'Customers', href: paths.customers.index },
                    { key: 'suppliers', label: 'Suppliers', href: paths.suppliers.index },
                ],
            },
            {
                title: 'Reports',
                items: [
                    { key: 'reports', label: 'Report Center', href: paths.reports.index },
                    { key: 'report-sales', label: 'Sales Register', href: paths.reports.sales },
                    { key: 'report-payments', label: 'Payment Report', href: paths.reports.payments },
                    { key: 'report-stock', label: 'Stock Summary', href: paths.reports.inventory },
                ],
            },
            {
                title: 'System',
                items: [
                    { key: 'dashboard', label: 'Main Menu', href: paths.dashboard },
                    { key: 'settings', label: 'Settings', href: paths.settings },
                    { key: 'backups', label: 'Backup / Restore', href: paths.backups },
                ],
            },
        ],
        [],
    );

    const filteredSections = useMemo(() => {
        if (!isViewOnly) {
            return navSections;
        }

        return navSections.map((section) => ({
            ...section,
            items: section.items.filter((item) => !['new-invoice', 'new-receipt', 'new-payment', 'settings', 'backups'].includes(item.key)),
        }));
    }, [isViewOnly, navSections]);

    const flatNav = useMemo(() => filteredSections.flatMap((section) => section.items), [filteredSections]);
    const defaultNavIndex = useMemo(() => Math.max(flatNav.findIndex((item) => item.key === activeKey), 0), [activeKey, flatNav]);
    const [focusedNavIndex, setFocusedNavIndex] = useState(defaultNavIndex);

    useEffect(() => {
        setFocusedNavIndex(defaultNavIndex);
    }, [defaultNavIndex]);

    useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            if (isEditableTarget(event.target)) {
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                const nextIndex = Math.min(focusedNavIndex + 1, flatNav.length - 1);
                setFocusedNavIndex(nextIndex);
                navRefs.current[nextIndex]?.focus();
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                const nextIndex = Math.max(focusedNavIndex - 1, 0);
                setFocusedNavIndex(nextIndex);
                navRefs.current[nextIndex]?.focus();
            }

            if (event.key === 'Enter') {
                const target = navRefs.current[focusedNavIndex];

                if (target) {
                    event.preventDefault();
                    target.click();
                }
            }
        };

        window.addEventListener('keydown', listener);

        return () => {
            window.removeEventListener('keydown', listener);
        };
    }, [flatNav.length, focusedNavIndex]);

    const fiscalLabel = page.props.settings.fiscalYear.label ? `FY ${page.props.settings.fiscalYear.label}` : 'FY ---';
    const currentMode = mode ?? 'Draft';
    const dateMode = page.props.settings.displayBsDates ? 'BS dates' : 'AD dates';
    const buildLabel = `v${page.props.appVersion ?? '0.0.0'}`;

    const submitInvoiceSearch = () => {
        router.visit(withQuery(paths.invoices.index, { q: invoiceSearch }), {
            preserveState: false,
            preserveScroll: true,
        });
    };

    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
        if (key === 'settings') {
            router.visit(paths.settings);
            return;
        }

        if (key === 'company') {
            router.post(paths.company.change);
            return;
        }

        if (key === 'logout') {
            router.post(paths.logout);
        }
    };

    const menuItems: MenuProps['items'] = [
        {
            key: 'identity',
            label: (
                <div className="dp-menu-identity">
                    <strong>{page.props.auth.user?.name ?? 'Admin'}</strong>
                    <span>{formatRole(page.props.auth.user?.role)}</span>
                    <span>{buildLabel}</span>
                </div>
            ),
            disabled: true,
        },
        {
            key: 'settings',
            label: 'Settings',
        },
        {
            key: 'company',
            label: 'Company Screen',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Log Out',
        },
    ];

    useKeyboardShortcuts([
        {
            key: 'n',
            alt: true,
            allowInInputs: true,
            handler: () => {
                if (!isViewOnly) {
                    router.visit(paths.invoices.create);
                }
            },
        },
        {
            key: 'p',
            alt: true,
            allowInInputs: true,
            handler: () => {
                if (!isViewOnly) {
                    router.visit(paths.payments.createReceived);
                }
            },
        },
        {
            key: 'r',
            alt: true,
            allowInInputs: true,
            handler: () => router.visit(paths.reports.index),
        },
        {
            key: 'd',
            alt: true,
            allowInInputs: true,
            handler: () => router.visit(paths.dashboard),
        },
        {
            key: '\\',
            alt: true,
            allowInInputs: true,
            handler: () => setSidebarHidden((value) => !value),
        },
        {
            key: 'i',
            alt: true,
            allowInInputs: true,
            handler: () => {
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
        {
            key: 'k',
            alt: true,
            allowInInputs: true,
            handler: () => router.visit(paths.customers.index),
        },
        {
            key: 'u',
            alt: true,
            allowInInputs: true,
            handler: () => router.visit(paths.suppliers.index),
        },
        {
            key: 'm',
            alt: true,
            allowInInputs: true,
            handler: () => router.visit(paths.items.index),
        },
    ]);

    let runningIndex = 0;

    return (
        <Layout className="dp-shell" style={{ minHeight: '100vh' }}>
            {!sidebarHidden ? (
                <Sider width={216} theme="dark" trigger={null} style={{ background: '#162032' }}>
                    <div className="dp-sidebar">
                        <div className="dp-sidebar-header">
                            <div className="dp-sidebar-brand">DeskERP</div>
                            <div className="dp-sidebar-company">{companyName}</div>
                        </div>

                        {filteredSections.map((section) => (
                            <section className="dp-sidebar-group" key={section.title}>
                                <h3 className="dp-sidebar-group-title">{section.title}</h3>
                                {section.items.map((item) => {
                                    const navIndex = runningIndex++;

                                    return (
                                        <button
                                            key={item.key}
                                            type="button"
                                            ref={(element) => {
                                                navRefs.current[navIndex] = element;
                                            }}
                                            tabIndex={0}
                                            className="dp-nav-link"
                                            data-active={activeKey === item.key || focusedNavIndex === navIndex}
                                            onFocus={() => setFocusedNavIndex(navIndex)}
                                            onClick={() => router.visit(item.href)}
                                        >
                                            <span>{item.label}</span>
                                        </button>
                                    );
                                })}
                            </section>
                        ))}

                        <div className="dp-sidebar-footer">
                            <div>{fiscalLabel}</div>
                            <div>{page.props.auth.user?.name ?? 'Admin'}</div>
                            <div>{buildLabel}</div>
                        </div>
                    </div>
                </Sider>
            ) : null}

            <Layout>
                <Header className="dp-topbar">
                    <div className="dp-topbar-left">
                        <Button size="small" onClick={() => setSidebarHidden((value) => !value)}>
                            {sidebarHidden ? 'Menu' : 'Hide Menu'}
                        </Button>
                        <span className="dp-topbar-title" data-testid="app-shell-title">
                            DESKERP
                        </span>
                        <span className="dp-topbar-meta">{companyName}</span>
                        <span className="dp-chip">{fiscalLabel}</span>
                    </div>

                    <div className="dp-topbar-right">
                        <Input
                            size="small"
                            className="dp-global-search"
                            data-global-search="true"
                            value={invoiceSearch}
                            onChange={(event) => setInvoiceSearch(event.target.value)}
                            onPressEnter={submitInvoiceSearch}
                            placeholder="Search invoice number"
                        />
                        {!isViewOnly ? (
                            <>
                                <Button size="small" type="primary" onClick={() => router.visit(paths.invoices.create)}>
                                    New Invoice
                                </Button>
                                <Button size="small" onClick={() => router.visit(paths.payments.createReceived)}>
                                    New Payment
                                </Button>
                            </>
                        ) : null}
                        <Button size="small" onClick={() => router.visit(paths.reports.index)}>
                            Reports
                        </Button>
                        <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']} placement="bottomRight">
                            <Button size="small">{page.props.auth.user?.name ?? 'Admin'}</Button>
                        </Dropdown>
                    </div>
                </Header>

                <Content className="dp-content">
                    {page.props.flash.success ? <div className="dp-inline-message dp-inline-message-success">{page.props.flash.success}</div> : null}
                    {page.props.flash.error ? <div className="dp-inline-message dp-inline-message-error">{page.props.flash.error}</div> : null}

                    <div className="dp-page-header">
                        <div>
                            <h1 className="dp-title">{title}</h1>
                            {subtitle ? <p className="dp-subtitle">{subtitle}</p> : null}
                        </div>
                        {extra ? <div className="dp-page-header-extra">{extra}</div> : null}
                    </div>

                    {children}
                </Content>

                <div className="dp-status-bar">
                    <span>{fiscalLabel}</span>
                    <span>|</span>
                    <span>{companyName}</span>
                    <span>|</span>
                    <span>{page.props.auth.user?.name ?? 'Admin'}</span>
                    <span>|</span>
                    <span>{formatRole(page.props.auth.user?.role)}</span>
                    <span>|</span>
                    <span>Mode: {currentMode}</span>
                    <span>|</span>
                    <span>{dateMode}</span>
                    <span className="dp-status-spacer" />
                    <span>{buildLabel}</span>
                </div>
            </Layout>
        </Layout>
    );
}
