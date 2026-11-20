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
        lightMode: 'Lichte modus',
        darkMode: 'Donkere modus',
        search: 'Zoeken',
        previous: 'Vorige',
        next: 'Volgende',
        logout: 'Uitloggen',
    },
    notifications: {
        title: 'Notificaties',
        new: 'Nieuwe notificatie',
        edit: 'Notificatie wijzigen',
        deleteTitle: 'Notificatie verwijderen',
        deleteDescription:
            'Weet je zeker dat je deze notificatie wilt verwijderen? Dit kan niet ongedaan worden gemaakt.',
        noResults: 'Geen notificaties gevonden',
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
    notAllowed: {
        contactPrefix:
            'Notificaties is alleen beschikbaar voor geautoriseerde gebruikers. Neem contact op met',
        contactSuffix: 'bij vragen.',
        orPrefix: 'Of',
        login: 'log opnieuw in',
        orSuffix: 'met een andere instelling',
    },
    loggedOut: {
        title: 'Je bent uitgelogd',
        description: 'Je bent uitgelogd bij Notificaties.',
        login: 'Opnieuw inloggen',
    },
};

export default nl;
