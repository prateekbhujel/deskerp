import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePlatformShortcuts } from '@/hooks/usePlatformShortcuts';
import { paths, withQuery } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { router, usePage } from '@inertiajs/react';
import { Button, Input, Layout } from 'antd';
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
    shortcut?: string;
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

export function AppShell({ title, subtitle, activeKey, extra, children, mode }: AppShellProps) {
    const page = usePage<SharedProps>();
    const { isMac, shortcuts } = usePlatformShortcuts();
    const [sidebarHidden, setSidebarHidden] = useState(false);
    const [invoiceSearch, setInvoiceSearch] = useState('');
    const navRefs = useRef<Array<HTMLElement | null>>([]);
    const isViewOnly = page.props.auth.user?.role === 'view_only';

    const navSections = useMemo<NavSection[]>(
        () => [
            {
                title: 'Transactions',
                items: [
                    { key: 'new-invoice', label: 'Sales Voucher', href: paths.invoices.create, shortcut: shortcuts.newInvoice },
                    { key: 'new-receipt', label: 'Receive Payment', href: paths.payments.createReceived, shortcut: shortcuts.newPayment },
                    { key: 'new-payment', label: 'Make Payment', href: paths.payments.createMade },
                    { key: 'invoices', label: 'Invoices Register', href: paths.invoices.index, shortcut: shortcuts.searchInvoice },
                    { key: 'payments', label: 'Payments Register', href: paths.payments.index },
                ],
            },
            {
                title: 'Masters',
                items: [
                    { key: 'items', label: 'Items & Pricing', href: paths.items.index, shortcut: isMac ? '⌥M' : 'Alt+M' },
                    { key: 'customers', label: 'Customers', href: paths.customers.index, shortcut: isMac ? '⌥K' : 'Alt+K' },
                    { key: 'suppliers', label: 'Suppliers', href: paths.suppliers.index, shortcut: isMac ? '⌥U' : 'Alt+U' },
                ],
            },
            {
                title: 'Reports',
                items: [
                    { key: 'reports', label: 'Main Reports', href: paths.reports.index, shortcut: shortcuts.reports },
                    { key: 'report-sales', label: 'Sales Register', href: paths.reports.sales },
                    { key: 'report-payments', label: 'Payment Report', href: paths.reports.payments },
                    { key: 'report-stock', label: 'Stock Summary', href: paths.reports.inventory },
                ],
            },
            {
                title: 'System',
                items: [
                    { key: 'dashboard', label: 'Main Menu', href: paths.dashboard, shortcut: isMac ? '⌥D' : 'Alt+D' },
                    { key: 'settings', label: 'Settings / Fiscal Year', href: paths.settings },
                    { key: 'backups', label: 'Backup / Restore', href: paths.backups },
                ],
            },
        ],
        [isMac, shortcuts.newInvoice, shortcuts.newPayment, shortcuts.reports, shortcuts.searchInvoice],
    );

    const filteredSections = useMemo(() => {
        if (!isViewOnly) {
            return navSections;
        }

        return navSections.map((section) => ({
            ...section,
            items: section.items.filter((item) => !['new-invoice', 'new-receipt', 'new-payment'].includes(item.key)),
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
    const todayDate = new Date().toLocaleDateString('en-CA');

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
                <Sider width={220} theme="dark" trigger={null} style={{ background: '#1a1e2e' }}>
                    <div className="dp-sidebar">
                        <div className="dp-sidebar-header">
                            <span className="dp-sidebar-title">DESKERP</span>
                            <span className="dp-kbd">{shortcuts.toggleSidebar}</span>
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
                                            {item.shortcut ? <span className="dp-kbd">{item.shortcut}</span> : null}
                                        </button>
                                    );
                                })}
                            </section>
                        ))}

                        <div className="dp-sidebar-footer">
                            <div>{fiscalLabel}</div>
                            <div>{page.props.auth.user?.name ?? 'Admin'}</div>
                            <div>{(page.props.auth.user?.role ?? 'admin').replace('_', ' ')}</div>
                        </div>
                    </div>
                </Sider>
            ) : null}

            <Layout>
                <Header className="dp-topbar">
                    <div className="dp-topbar-left">
                        <span className="dp-topbar-title" data-testid="app-shell-title">
                            DESKERP
                        </span>
                        <span className="dp-chip">{fiscalLabel}</span>
                        <span>{page.props.auth.user?.name ?? 'Admin'}</span>
                        <span style={{ color: '#6b7280' }}>{title.toUpperCase()}</span>
                        {subtitle ? <span style={{ color: '#8b93a8' }}>{subtitle}</span> : null}
                    </div>

                    <div className="dp-topbar-right">
                        <Input
                            size="small"
                            style={{ width: 220 }}
                            data-global-search="true"
                            value={invoiceSearch}
                            onChange={(event) => setInvoiceSearch(event.target.value)}
                            onPressEnter={submitInvoiceSearch}
                            placeholder={`Search Invoice ${shortcuts.searchInvoice}`}
                        />
                        {!isViewOnly ? (
                            <>
                                <Button size="small" type="primary" onClick={() => router.visit(paths.invoices.create)}>
                                    Invoice {shortcuts.newInvoice}
                                </Button>
                                <Button size="small" onClick={() => router.visit(paths.payments.createReceived)}>
                                    Payment {shortcuts.newPayment}
                                </Button>
                            </>
                        ) : null}
                        <Button size="small" onClick={() => router.visit(paths.reports.index)}>
                            Reports {shortcuts.reports}
                        </Button>
                    </div>
                </Header>

                <Content className="dp-content">
                    {page.props.flash.success ? <div className="dp-inline-message dp-inline-message-success">{page.props.flash.success}</div> : null}
                    {page.props.flash.error ? <div className="dp-inline-message dp-inline-message-error">{page.props.flash.error}</div> : null}
                    {children}
                    {extra ? <div style={{ marginTop: 8 }}>{extra}</div> : null}
                </Content>

                <div className="dp-status-bar">
                    <span>{fiscalLabel}</span>
                    <span>|</span>
                    <span>{page.props.auth.user?.name ?? 'Admin'}</span>
                    <span>|</span>
                    <span>Mode: {currentMode}</span>
                    <span>|</span>
                    <span>Date: {todayDate}</span>
                    <span>|</span>
                    <span>{shortcuts.save}: Save</span>
                    <span>|</span>
                    <span>Esc: Back</span>
                </div>
            </Layout>
        </Layout>
    );
}
