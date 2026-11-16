import { useNavigate } from 'react-router';

import { Button, NativeSelect, NativeSelectOption } from '@surfnet/curve-react';

import { logout } from '../api/notifications';
import I18n, { AVAILABLE_LANGUAGES, switchLocale } from '../locale/I18n';
import { useConfigStore } from '../store/config';

export const Header = () => {
    const navigate = useNavigate();
    const user = useConfigStore((state) => state.config?.user);

    const doLogout = async () => {
        await logout();
        useConfigStore.setState({ config: null });
        await navigate('/logged-out');
    };

    return (
        <header className="header">
            <strong>{I18n.t('globalVariables.productName')}</strong>
            <div className="header-actions">
                <NativeSelect
                    aria-label={I18n.t('languages.language')}
                    data-testid="language"
                    value={I18n.locale}
                    onChange={(e) => {
                        switchLocale(e.target.value);
                        window.location.reload();
                    }}
                >
                    {AVAILABLE_LANGUAGES.map((lang) => (
                        <NativeSelectOption key={lang} value={lang}>
                            {I18n.t(`languages.${lang}`)}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>
                <span data-testid="user">{user}</span>
                <Button
                    variant="outline"
                    data-testid="logout"
                    onClick={doLogout}
                >
                    {I18n.t('common.logout')}
                </Button>
            </div>
        </header>
    );
};
