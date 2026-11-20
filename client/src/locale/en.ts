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
        lightMode: 'Light mode',
        darkMode: 'Dark mode',
        search: 'Search',
        previous: 'Previous',
        next: 'Next',
        logout: 'Log out',
        help: 'Help',
    },
    notifications: {
        title: 'Notifications',
        new: 'New notification',
        edit: 'Edit notification',
        deleteTitle: 'Delete notification',
        deleteDescription:
            'Are you sure you want to delete this notification? This cannot be undone.',
        noResults: 'No notifications match your search',
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
    notAllowed: {
        contactPrefix:
            'Notifications is only available to authorised users. Please contact',
        contactSuffix: 'with questions.',
        orPrefix: 'Or',
        login: 'log in',
        orSuffix: 'again with a different institution',
    },
    help: {
        title: 'Help',
        apiTitle: 'Server-to-server API',
        intro: 'The applications the notifications are for use the server-to-server API to retrieve their notifications. An application only gets its own notifications, and only the ones that are active now (start <= now < end), newest first.',
        auth: 'The API uses HTTP Basic authentication: the username is the target application and the password is the one configured for that application in the server configuration.',
        requestTitle: 'Request',
        htmlDescription:
            'The text rendered (and sanitized) as HTML, this is the default:',
        markdownDescription: 'The markdown source:',
        responseTitle: 'Response',
        unauthorized: 'A wrong username or password returns 401.',
        howTitle: 'How it works',
        howSource:
            'The text of a notification is written in markdown. It is rendered and sanitized to HTML by the server when the format is html.',
        howCleanup:
            'Notifications that ended more than 5 days ago are removed automatically. This runs every hour, on one node at a time.',
    },
    loggedOut: {
        title: 'You are logged out',
        description: 'You have been logged out of Notifications.',
        login: 'Log in again',
    },
};

export default en;
