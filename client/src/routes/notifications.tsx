import { useState } from 'react';
import { Link } from 'react-router';

import { toast } from 'sonner';

import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    buttonVariants,
} from '@surfnet/curve-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteNotification, fetchNotifications } from '../api/notifications';
import { Header } from '../components/Header';
import I18n from '../locale/I18n';

const format = (iso: string) => new Date(iso).toLocaleString(I18n.locale);

export default function Notifications() {
    const queryClient = useQueryClient();
    const [confirming, setConfirming] = useState<number | null>(null);
    const { data, isError } = useQuery({
        queryKey: ['notifications'],
        queryFn: fetchNotifications,
    });
    const remove = useMutation({
        mutationFn: deleteNotification,
        onSuccess: async () => {
            setConfirming(null);
            toast.success(I18n.t('notifications.deleted'));
            await queryClient.invalidateQueries({
                queryKey: ['notifications'],
            });
        },
    });

    return (
        <>
            <Header />
            <main className="page">
                <div className="toolbar">
                    <h1>{I18n.t('notifications.title')}</h1>
                    <Link
                        to="/new"
                        data-testid="new-notification"
                        className={buttonVariants()}
                    >
                        {I18n.t('notifications.new')}
                    </Link>
                </div>
                {isError && <p role="alert">{I18n.t('common.error')}</p>}
                {data && data.length === 0 && (
                    <p data-testid="empty">{I18n.t('notifications.empty')}</p>
                )}
                {data && data.length > 0 && (
                    <Table data-testid="notifications-table">
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    {I18n.t('notifications.columns.targetApp')}
                                </TableHead>
                                <TableHead>
                                    {I18n.t('notifications.columns.startAt')}
                                </TableHead>
                                <TableHead>
                                    {I18n.t('notifications.columns.endsAt')}
                                </TableHead>
                                <TableHead>
                                    {I18n.t('notifications.columns.creator')}
                                </TableHead>
                                <TableHead>
                                    {I18n.t('notifications.columns.text')}
                                </TableHead>
                                <TableHead>
                                    {I18n.t('notifications.columns.actions')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((n) => (
                                <TableRow
                                    key={n.id}
                                    data-testid={`notification-${n.id}`}
                                >
                                    <TableCell>{n.targetApp}</TableCell>
                                    <TableCell>{format(n.startAt)}</TableCell>
                                    <TableCell>{format(n.endsAt)}</TableCell>
                                    <TableCell>{n.creator}</TableCell>
                                    <TableCell data-testid="notification-text">
                                        {n.htmlText.length > 80
                                            ? `${n.htmlText.substring(0, 80)}…`
                                            : n.htmlText}
                                    </TableCell>
                                    <TableCell>
                                        <div className="row-actions">
                                            <Link
                                                to={`/edit/${n.id}`}
                                                data-testid="notification-edit"
                                                className={buttonVariants({
                                                    variant: 'outline',
                                                })}
                                            >
                                                {I18n.t('common.edit')}
                                            </Link>
                                            {confirming === n.id ? (
                                                <>
                                                    <Button
                                                        variant="destructive"
                                                        data-testid="notification-delete-confirm"
                                                        onClick={() =>
                                                            remove.mutate(n.id)
                                                        }
                                                    >
                                                        {I18n.t(
                                                            'common.confirmDelete',
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            setConfirming(null)
                                                        }
                                                    >
                                                        {I18n.t(
                                                            'common.cancel',
                                                        )}
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    data-testid="notification-delete"
                                                    onClick={() =>
                                                        setConfirming(n.id)
                                                    }
                                                >
                                                    {I18n.t('common.delete')}
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </main>
        </>
    );
}
