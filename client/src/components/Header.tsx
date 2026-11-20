import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import {
    CaretDownIcon,
    GlobeIcon,
    MoonIcon,
    SignOutIcon,
    SunIcon,
} from '@phosphor-icons/react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@surfnet/curve-react';

import { logout } from '../api/notifications';
import logo from '../icons/img.png';
import I18n, { AVAILABLE_LANGUAGES, switchLocale } from '../locale/I18n';
import { displayName, useConfigStore } from '../store/config';
import { type Theme, getTheme, setTheme } from '../store/theme';

export const Header = () => {
    const navigate = useNavigate();
    const user = useConfigStore((state) => state.config?.user);
    const [theme, setThemeState] = useState<Theme>(getTheme);

    // the menu offers the language that is not active yet
    const otherLanguage =
        AVAILABLE_LANGUAGES.find((lang) => lang !== I18n.locale) ?? 'en';
    const otherTheme: Theme = theme === 'dark' ? 'light' : 'dark';

    const doLogout = async () => {
        await logout();
        useConfigStore.setState({ config: null });
        await navigate('/logged-out');
    };

    return (
        <header className="header-bar">
            <div className="header">
                <Link
                    to="/"
                    className="header-logo"
                    aria-label={I18n.t('globalVariables.productName')}
                    data-testid="home"
                >
                    <img
                        src={logo}
                        alt={I18n.t('globalVariables.productName')}
                    />
                </Link>
                <div className="header-user">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button variant="ghost" data-testid="user" />
                            }
                        >
                            {displayName(user)}
                            <CaretDownIcon aria-hidden="true" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                data-testid="language"
                                onClick={() => {
                                    switchLocale(otherLanguage);
                                    window.location.reload();
                                }}
                            >
                                <GlobeIcon aria-hidden="true" />
                                {I18n.t(`languages.${otherLanguage}`)}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                data-testid="theme"
                                onClick={() => {
                                    setTheme(otherTheme);
                                    setThemeState(otherTheme);
                                }}
                            >
                                {otherTheme === 'dark' ? (
                                    <MoonIcon aria-hidden="true" />
                                ) : (
                                    <SunIcon aria-hidden="true" />
                                )}
                                {I18n.t(`common.${otherTheme}Mode`)}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                data-testid="logout"
                                onClick={doLogout}
                            >
                                <SignOutIcon aria-hidden="true" />
                                {I18n.t('common.logout')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};
