import { AppShell } from '@/components/layout/AppShell';
import { paths } from '@/lib/paths';
import { useForm } from '@inertiajs/react';
import { DownloadOutlined, ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Empty, Input, List, Space, Typography, Upload } from 'antd';

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
        <AppShell
            title="Backup / Restore"
            subtitle="Download local backup files and restore when needed."
            activeKey="backups"
            extra={
                <a href={paths.backupsDownload}>
                    <Button type="primary" icon={<DownloadOutlined />}>
                        Download Backup
                    </Button>
                </a>
            }
        >
            <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                    <Card title="Create Backup" className="dp-dense-card">
                        <Space direction="vertical" size={12} style={{ display: 'flex' }}>
                            <Typography.Text type="secondary">Create a timestamped SQLite backup of current DeskERP data.</Typography.Text>
                            <a href={paths.backupsDownload}>
                                <Button type="primary" icon={<DownloadOutlined />}>
                                    Download Backup
                                </Button>
                            </a>
                        </Space>
                    </Card>

                    <Card title="Restore Backup" className="dp-dense-card">
                        <Space direction="vertical" size={12} style={{ display: 'flex' }}>
                            <Alert
                                showIcon
                                type="warning"
                                icon={<ExclamationCircleOutlined />}
                                message="Restore will replace the current database."
                                description="Make sure users have stopped data entry before restoring."
                            />

                            <div>
                                <Typography.Text strong>SQLite Backup File</Typography.Text>
                                <div style={{ marginTop: 8 }}>
                                    <Upload
                                        maxCount={1}
                                        beforeUpload={() => false}
                                        accept=".sqlite,.db,application/x-sqlite3,application/vnd.sqlite3,application/octet-stream"
                                        onChange={({ fileList }) => {
                                            const nextFile = fileList[0]?.originFileObj as File | undefined;
                                            setData('backup_file', nextFile ?? null);
                                        }}
                                        onRemove={() => {
                                            setData('backup_file', null);
                                            return true;
                                        }}
                                    >
                                        <Button icon={<UploadOutlined />}>Choose File</Button>
                                    </Upload>
                                </div>
                                {errors.backup_file ? (
                                    <Typography.Text type="danger" style={{ display: 'block', marginTop: 6 }}>
                                        {errors.backup_file}
                                    </Typography.Text>
                                ) : null}
                            </div>

                            <div>
                                <Typography.Text strong>Confirmation (Type RESTORE)</Typography.Text>
                                <Input
                                    value={data.confirmation_text}
                                    onChange={(event) => setData('confirmation_text', event.target.value)}
                                    style={{ marginTop: 8 }}
                                    placeholder="RESTORE"
                                />
                                {errors.confirmation_text ? (
                                    <Typography.Text type="danger" style={{ display: 'block', marginTop: 6 }}>
                                        {errors.confirmation_text}
                                    </Typography.Text>
                                ) : null}
                            </div>

                            <Button danger type="primary" onClick={submitRestore} loading={processing} disabled={!data.backup_file}>
                                Restore Backup
                            </Button>
                        </Space>
                    </Card>
                </Space>

                <Card title="Recent Backups" className="dp-dense-card">
                    {backups.length ? (
                        <List
                            dataSource={backups}
                            renderItem={(backup) => (
                                <List.Item>
                                    <Space direction="vertical" size={2} style={{ display: 'flex', width: '100%' }}>
                                        <Typography.Text strong>{backup.name}</Typography.Text>
                                        <Typography.Text type="secondary">
                                            {formatFileSize(Number(backup.size))} / {backup.modified_at}
                                        </Typography.Text>
                                    </Space>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Empty description="No backups yet. Click Download Backup to create the first file." />
                    )}
                </Card>
            </div>
        </AppShell>
    );
}
