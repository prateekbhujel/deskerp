import '../css/app.css';
import 'antd/dist/reset.css';

import { createInertiaApp } from '@inertiajs/react';
import { InertiaProgress } from '@inertiajs/progress';
import { App as AntApp, ConfigProvider } from 'antd';
import { createRoot } from 'react-dom/client';

InertiaProgress.init({
    color: '#0f766e',
    showSpinner: false,
});

createInertiaApp({
    resolve: async (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx');
        const page = pages[`./pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Inertia page not found: ${name}`);
        }

        return page();
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: '#0f766e',
                        borderRadius: 8,
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
