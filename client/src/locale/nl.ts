import type { AppTranslation } from './translationType';

const nl: AppTranslation = {
    globalVariables: { productName: 'Notificaties' },
    code: 'NL',
    languages: { language: 'Taal', en: 'Engels', nl: 'Nederlands' },
    common: {
        loading: 'Laden...',
        error: 'Er is iets misgegaan',
        save: 'Opslaan',
        cancel: 'Annuleren',
        edit: 'Wijzigen',
        delete: 'Verwijderen',
        confirmDelete: 'Bevestig verwijderen',
        logout: 'Uitloggen',
    },
    notifications: {
        title: 'Notificaties',
        new: 'Nieuwe notificatie',
        edit: 'Notificatie wijzigen',
        empty: 'Er zijn geen notificaties',
        saved: 'Notificatie opgeslagen',
        deleted: 'Notificatie verwijderd',
        columns: {
            targetApp: 'Applicatie',
            startAt: 'Begint',
            endsAt: 'Eindigt',
            creator: 'Aanmaker',
            text: 'Tekst',
            actions: 'Acties',
        },
        form: {
            targetApp: 'Applicatie',
            startAt: 'Start',
            endsAt: 'Einde',
            text: 'Tekst (markdown)',
            invalidPeriod: 'Het einde moet na de start liggen',
        },
    },
    loggedOut: {
        title: 'Je bent uitgelogd',
        description: 'Je bent uitgelogd bij Notificaties.',
        login: 'Opnieuw inloggen',
    },
};

export default nl;
