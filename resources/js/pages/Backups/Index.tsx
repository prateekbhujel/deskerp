import { AppShell } from '@/components/layout/AppShell';
import { paths } from '@/lib/paths';
import { useForm } from '@inertiajs/react';
import { Button, Input, Table } from 'antd';

interface BackupRecord {
    name: string;
    size: number;
    modified_at: string;
}

interface BackupIndexProps {
    backups: BackupRecord[];
}

function formatFileSize(bytes: number): string {
    if (!bytes || Number.isNaN(bytes)) {
        return '0 KB';
    }

    const kb = bytes / 1024;

    if (kb < 1024) {
        return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(2)} MB`;
}

export default function BackupIndex({ backups }: BackupIndexProps) {
    const { data, setData, post, processing, errors, reset } = useForm<{
        backup_file: File | null;
        confirmation_text: string;
    }>({
        backup_file: null,
        confirmation_text: '',
    });

    const submitRestore = () => {
        post(paths.backupsRestore, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AppShell title="Backup / Restore" subtitle="SQLite export and restore" activeKey="backups">
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Create Backup</h3>
                    </div>
                    <div className="dp-section-body">
                        <div className="dp-inline-meta" style={{ marginBottom: 10 }}>Download a timestamped copy of the active SQLite database file.</div>
                        <a href={paths.backupsDownload}>
                            <Button type="primary">Download Backup</Button>
                        </a>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Restore Backup</h3>
                    </div>
                    <div className="dp-form-grid">
                        <div className="dp-field col-span-12 xl:col-span-4">
                            <label className="dp-field-label">Backup File (.sqlite/.db)</label>
                            <Input
                                type="file"
                                onChange={(event) => {
                                    const nextFile = event.target.files?.[0] ?? null;
                                    setData('backup_file', nextFile);
                                }}
                            />
                            {errors.backup_file ? <span className="dp-error-text">{errors.backup_file}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Type RESTORE</label>
                            <Input value={data.confirmation_text} onChange={(event) => setData('confirmation_text', event.target.value)} />
                            {errors.confirmation_text ? <span className="dp-error-text">{errors.confirmation_text}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-5">
                            <label className="dp-field-label">Warning</label>
                            <div>Restore replaces the current database. Stop data entry before proceeding.</div>
                            <div style={{ marginTop: 8 }}>
                                <Button danger type="primary" onClick={submitRestore} loading={processing} disabled={!data.backup_file}>
                                    Restore Backup
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Recent Backups</h3>
                    </div>
                    <Table
                        rowKey="name"
                        size="small"
                        pagination={false}
                        dataSource={backups}
                        locale={{ emptyText: 'No backups available.' }}
                        columns={[
                            { title: 'File', dataIndex: 'name' },
                            { title: 'Size', render: (_, record) => formatFileSize(Number(record.size)) },
                            { title: 'Modified', dataIndex: 'modified_at' },
                        ]}
                    />
                </section>
            </div>
        </AppShell>
    );
}
