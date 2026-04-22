import '../css/app.css';
import 'antd/dist/reset.css';

import { createInertiaApp } from '@inertiajs/react';
import { InertiaProgress } from '@inertiajs/progress';
import { App as AntApp, ConfigProvider } from 'antd';
import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';

InertiaProgress.init({
    color: '#0f766e',
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
                        colorPrimary: '#0f766e',
                        borderRadius: 0,
                        borderRadiusLG: 0,
                        borderRadiusSM: 0,
                        boxShadow: 'none',
                        boxShadowSecondary: 'none',
                        boxShadowTertiary: 'none',
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                        fontSize: 12,
                    },
                    components: {
                        Button: {
                            borderRadius: 0,
                            boxShadow: 'none',
                        },
                        Input: {
                            borderRadius: 0,
                            activeShadow: 'none',
                        },
                        Select: {
                            borderRadius: 0,
                            activeOutlineColor: 'transparent',
                        },
                        Table: {
                            borderRadius: 0,
                            headerBorderRadius: 0,
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
