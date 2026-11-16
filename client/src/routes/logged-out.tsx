import { Button } from '@surfnet/curve-react';

import { LOGIN_URL } from '../api/apiFetch';
import I18n from '../locale/I18n';

export default function LoggedOut() {
    return (
        <main className="centered" data-testid="logged-out">
            <h1>{I18n.t('loggedOut.title')}</h1>
            <p>{I18n.t('loggedOut.description')}</p>
            {/* force=true makes the server send prompt=login: the user must authenticate again */}
            <Button
                data-testid="login-again"
                onClick={() => {
                    window.location.href = `${LOGIN_URL}?force=true`;
                }}
            >
                {I18n.t('loggedOut.login')}
            </Button>
        </main>
    );
}
