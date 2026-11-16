import type { AppTranslation } from './translationType';

const en: AppTranslation = {
    globalVariables: { productName: 'Notifications' },
    code: 'EN',
    languages: { language: 'Language', en: 'English', nl: 'Dutch' },
    common: {
        loading: 'Loading...',
        error: 'Something went wrong',
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        confirmDelete: 'Confirm delete',
        logout: 'Log out',
    },
    notifications: {
        title: 'Notifications',
        new: 'New notification',
        edit: 'Edit notification',
        empty: 'There are no notifications',
        saved: 'Notification saved',
        deleted: 'Notification deleted',
        columns: {
            targetApp: 'Application',
            startAt: 'Starts',
            endsAt: 'Ends',
            creator: 'Creator',
            text: 'Text',
            actions: 'Actions',
        },
        form: {
            targetApp: 'Application',
            startAt: 'Start',
            endsAt: 'End',
            text: 'Text (markdown)',
            invalidPeriod: 'The end must be after the start',
        },
    },
    loggedOut: {
        title: 'You are logged out',
        description: 'You have been logged out of Notifications.',
        login: 'Log in again',
    },
};

export default en;
