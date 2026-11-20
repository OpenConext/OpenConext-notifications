import { Header } from '../components/Header';
import { NotificationsTable } from '../components/NotificationsTable';
import I18n from '../locale/I18n';

export default function Notifications() {
    return (
        <>
            <Header />
            <main className="page page-wide">
                <h1>{I18n.t('notifications.title')}</h1>
                <NotificationsTable />
            </main>
        </>
    );
}
