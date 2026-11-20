export type AppTranslation = {
    globalVariables: { productName: string };
    code: string;
    languages: { language: string; en: string; nl: string };
    common: {
        loading: string;
        error: string;
        save: string;
        cancel: string;
        edit: string;
        delete: string;
        confirmDelete: string;
        lightMode: string;
        darkMode: string;
        search: string;
        previous: string;
        next: string;
        logout: string;
    };
    notifications: {
        title: string;
        new: string;
        edit: string;
        deleteTitle: string;
        deleteDescription: string;
        noResults: string;
        empty: string;
        saved: string;
        deleted: string;
        columns: {
            targetApp: string;
            startAt: string;
            endsAt: string;
            creator: string;
            text: string;
            actions: string;
        };
        form: {
            targetApp: string;
            startAt: string;
            endsAt: string;
            text: string;
            invalidPeriod: string;
        };
    };
    notAllowed: {
        contactPrefix: string;
        contactSuffix: string;
        orPrefix: string;
        login: string;
        orSuffix: string;
    };
    loggedOut: { title: string; description: string; login: string };
};
