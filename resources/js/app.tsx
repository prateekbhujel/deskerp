import '../css/app.css';
import 'antd/dist/reset.css';

import { createInertiaApp } from '@inertiajs/react';
import { InertiaProgress } from '@inertiajs/progress';
import { App as AntApp, ConfigProvider } from 'antd';
import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';

InertiaProgress.init({
    color: '#1677ff',
    showSpinner: false,
});

createInertiaApp({
    resolve: async (name) => {
        const pages = import.meta.glob<{ default: ComponentType }>('./pages/**/*.tsx');
        const pageImport = pages[`./pages/${name}.tsx`];

        if (!pageImport) {
            throw new Error(`Inertia page not found: ${name}`);
        }

        const page = await pageImport();

        return page.default;
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: '#1677ff',
                        borderRadius: 6,
                        borderRadiusLG: 6,
                        borderRadiusSM: 4,
                        boxShadow: 'none',
                        boxShadowSecondary: 'none',
                        boxShadowTertiary: 'none',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                        fontSize: 13,
                    },
                    components: {
                        Button: {
                            borderRadius: 6,
                            defaultShadow: 'none',
                            primaryShadow: 'none',
                        },
                        Input: {
                            borderRadius: 6,
                            activeShadow: '0 0 0 2px rgba(22,119,255,0.16)',
                        },
                        Select: {
                            borderRadius: 6,
                            activeOutlineColor: 'rgba(22,119,255,0.16)',
                        },
                        Table: {
                            borderRadius: 6,
                            headerBorderRadius: 6,
                        },
                    },
                }}
            >
                <AntApp>
                    <App {...props} />
                </AntApp>
            </ConfigProvider>,
        );
    },
});
