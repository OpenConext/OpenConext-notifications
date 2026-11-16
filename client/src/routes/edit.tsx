import { useNavigate, useParams } from 'react-router';

import { toast } from 'sonner';

import { Spinner } from '@surfnet/curve-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchNotification, updateNotification } from '../api/notifications';
import { Header } from '../components/Header';
import { NotificationForm } from '../components/NotificationForm';
import I18n from '../locale/I18n';

export default function EditNotification() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data } = useQuery({
        queryKey: ['notification', id],
        queryFn: () => fetchNotification(id),
    });
    const update = useMutation({
        mutationFn: (input: Parameters<typeof updateNotification>[1]) =>
            updateNotification(id, input),
        onSuccess: async () => {
            toast.success(I18n.t('notifications.saved'));
            await queryClient.invalidateQueries({
                queryKey: ['notifications'],
            });
            await queryClient.invalidateQueries({
                queryKey: ['notification', id],
            });
            await navigate('/');
        },
    });

    return (
        <>
            <Header />
            <main className="page">
                <h1>{I18n.t('notifications.edit')}</h1>
                {data ? (
                    <NotificationForm
                        initial={data}
                        saving={update.isPending}
                        onSave={(input) => update.mutate(input)}
                        onCancel={() => navigate('/')}
                    />
                ) : (
                    <Spinner />
                )}
            </main>
        </>
    );
}
