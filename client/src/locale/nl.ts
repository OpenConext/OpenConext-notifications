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
        help: 'Help',
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
    help: {
        title: 'Help',
        apiTitle: 'Server-naar-server API',
        intro: 'De applicaties waarvoor de notificaties zijn gebruiken de server-naar-server API om hun notificaties op te halen. Een applicatie krijgt alleen de eigen notificaties, en alleen de notificaties die nu actief zijn (start <= nu < einde), nieuwste eerst.',
        auth: 'De API gebruikt HTTP Basic authenticatie: de gebruikersnaam is de doelapplicatie en het wachtwoord is het wachtwoord dat voor die applicatie in de serverconfiguratie is ingesteld.',
        requestTitle: 'Verzoek',
        htmlDescription:
            'De tekst als HTML gerenderd (en gesanitized), dit is de standaard:',
        markdownDescription: 'De markdown-bron:',
        responseTitle: 'Antwoord',
        unauthorized: 'Een onjuiste gebruikersnaam of wachtwoord geeft 401.',
        howTitle: 'Hoe het werkt',
        howSource:
            'De tekst van een notificatie is markdown. De server rendert en sanitized deze naar HTML wanneer het formaat html is.',
        howCleanup:
            'Notificaties die meer dan 5 dagen geleden zijn afgelopen worden automatisch verwijderd. Dit draait elk uur, op één node tegelijk.',
    },
    loggedOut: {
        title: 'Je bent uitgelogd',
        description: 'Je bent uitgelogd bij Notificaties.',
        login: 'Opnieuw inloggen',
    },
};

export default nl;
