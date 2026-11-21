import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import {
    CaretDownIcon,
    GlobeIcon,
    MoonIcon,
    QuestionIcon,
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
import { useQuery } from '@tanstack/react-query';

import { fetchNotifications, logout } from '../api/notifications';
import { NotificationIcon } from '../icons/NotificationIcon';
import I18n, { AVAILABLE_LANGUAGES, switchLocale } from '../locale/I18n';
import { displayName, useConfigStore } from '../store/config';
import { type Theme, getTheme, setTheme } from '../store/theme';

export const Header = () => {
    const navigate = useNavigate();
    const user = useConfigStore((state) => state.config?.user);
    const [theme, setThemeState] = useState<Theme>(getTheme);
    // same query key as the table, so this shares its cache and refreshes after changes
    const { data: notifications } = useQuery({
        queryKey: ['notifications'],
        queryFn: fetchNotifications,
    });

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
                    <NotificationIcon
                        count={notifications?.length ?? 0}
                        label={I18n.t('globalVariables.productName')}
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
                            <DropdownMenuItem
                                data-testid="help"
                                onClick={() => navigate('/help')}
                            >
                                <QuestionIcon aria-hidden="true" />
                                {I18n.t('common.help')}
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
