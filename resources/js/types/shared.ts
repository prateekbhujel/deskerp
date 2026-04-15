export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface SharedSettings {
    companyName: string;
    displayBsDates: boolean;
    fiscalYear: {
        label: string | null;
        startDate: string | null;
        endDate: string | null;
    };
    prefixes: {
        invoice: string;
        paymentReceived: string;
        paymentMade: string;
    };
    reportDefaults: {
        dateFrom: string;
        dateTo: string;
    };
}

export interface SharedProps {
    appName: string;
    auth: {
        user: AuthUser | null;
    };
    flash: {
        success?: string | null;
        error?: string | null;
    };
    settings: SharedSettings;
    errors: Record<string, string>;
}

export interface PaginatedMeta {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginatedMeta;
}

export interface LookupMeta {
    currentPage: number;
    perPage: number;
    hasMorePages: boolean;
    nextPage: number | null;
}

export interface LookupResponse<T> {
    data: T[];
    meta: LookupMeta;
}

export interface LookupOption<T> {
    value: number;
    label: string;
    record: T;
}

export interface SimpleOption {
    id: number;
    name: string;
}
