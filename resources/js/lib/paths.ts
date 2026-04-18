export const paths = {
    dashboard: '/dashboard',
    customers: {
        index: '/customers',
        store: '/customers',
    },
    suppliers: {
        index: '/suppliers',
    },
    items: {
        index: '/items',
        create: '/items/create',
        store: '/items',
        show: (id: number | string) => `/items/${id}`,
        edit: (id: number | string) => `/items/${id}/edit`,
    },
    invoices: {
        index: '/invoices',
        create: '/invoices/create',
        store: '/invoices',
        show: (id: number | string) => `/invoices/${id}`,
        edit: (id: number | string) => `/invoices/${id}/edit`,
        update: (id: number | string) => `/invoices/${id}`,
        print: (id: number | string) => `/invoices/${id}/print`,
        pdf: (id: number | string) => `/invoices/${id}/pdf`,
    },
    payments: {
        index: '/payments',
        create: '/payments/create',
        createReceived: '/payments/create?direction=received',
        createMade: '/payments/create?direction=made',
        store: '/payments',
        show: (id: number | string) => `/payments/${id}`,
        edit: (id: number | string) => `/payments/${id}/edit`,
        update: (id: number | string) => `/payments/${id}`,
    },
    reports: {
        index: '/reports',
        sales: '/reports/sales',
        payments: '/reports/payments',
        inventory: '/reports/inventory',
        customerLedger: (id: number | string) => `/reports/customers/${id}/ledger`,
        supplierLedger: (id: number | string) => `/reports/suppliers/${id}/ledger`,
    },
    settings: '/settings',
    backups: '/backups',
    lookups: {
        customers: '/api/lookups/customers',
        suppliers: '/api/lookups/suppliers',
        items: '/api/lookups/items',
        openInvoices: '/api/lookups/open-invoices',
    },
};

export function withQuery(path: string, params: Record<string, string | number | boolean | null | undefined>) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
            return;
        }

        query.set(key, String(value));
    });

    const serialized = query.toString();

    return serialized ? `${path}?${serialized}` : path;
}
