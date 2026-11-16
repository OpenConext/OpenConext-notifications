import { useNavigate } from 'react-router';

import { toast } from 'sonner';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createNotification } from '../api/notifications';
import { Header } from '../components/Header';
import { NotificationForm } from '../components/NotificationForm';
import I18n from '../locale/I18n';

export default function NewNotification() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const create = useMutation({
        mutationFn: createNotification,
        onSuccess: async () => {
            toast.success(I18n.t('notifications.saved'));
            await queryClient.invalidateQueries({
                queryKey: ['notifications'],
            });
            await navigate('/');
        },
    });

    return (
        <>
            <Header />
            <main className="page">
                <h1>{I18n.t('notifications.new')}</h1>
                <NotificationForm
                    saving={create.isPending}
                    onSave={(input) => create.mutate(input)}
                    onCancel={() => navigate('/')}
                />
            </main>
        </>
    );
}
