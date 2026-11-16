import { apiFetch } from './apiFetch';

export type Notification = {
    id: number;
    createdAt: string;
    startAt: string;
    endsAt: string;
    creator: string;
    htmlText: string;
    targetApp: string;
};

export type NotificationInput = Pick<
    Notification,
    'startAt' | 'endsAt' | 'htmlText' | 'targetApp'
>;

export const fetchNotifications = () =>
    apiFetch<Notification[]>('/api/notifications');

export const fetchNotification = (id: string) =>
    apiFetch<Notification>(`/api/notifications/${id}`);

export const createNotification = (input: NotificationInput) =>
    apiFetch<Notification>('/api/notifications', 'POST', input);

export const updateNotification = (id: string, input: NotificationInput) =>
    apiFetch<Notification>(`/api/notifications/${id}`, 'PUT', input);

export const deleteNotification = (id: number) =>
    apiFetch<void>(`/api/notifications/${id}`, 'DELETE');

export const logout = () => apiFetch<void>('/logout', 'POST');
