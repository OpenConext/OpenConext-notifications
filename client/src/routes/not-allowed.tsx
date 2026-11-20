import { WarningIcon } from '@phosphor-icons/react';
import { Alert, AlertDescription } from '@surfnet/curve-react';

import { LOGIN_URL } from '../api/apiFetch';
import I18n from '../locale/I18n';

const SUPPORT = 'support@surfconext.nl';

// shown when the login is rejected by the server: the user is not a member of the required group
export default function NotAllowed() {
    const error =
        new URLSearchParams(window.location.search).get('reason') === 'error';

    return (
        <main className="page" data-testid="not-allowed">
            <Alert variant="warning">
                <WarningIcon aria-hidden="true" />
                <AlertDescription>
                    {error ? (
                        <p>{I18n.t('common.error')}</p>
                    ) : (
                        <p>
                            {I18n.t('notAllowed.contactPrefix')}{' '}
                            <a href={`mailto:${SUPPORT}`}>{SUPPORT}</a>{' '}
                            {I18n.t('notAllowed.contactSuffix')}
                        </p>
                    )}
                    <p>
                        {I18n.t('notAllowed.orPrefix')}{' '}
                        {/* force=true: the user must authenticate again, to be able to pick another institution */}
                        <a
                            href={`${LOGIN_URL}?force=true`}
                            data-testid="not-allowed-login"
                        >
                            {I18n.t('notAllowed.login')}
                        </a>{' '}
                        {I18n.t('notAllowed.orSuffix')}
                    </p>
                </AlertDescription>
            </Alert>
        </main>
    );
}
