import { Header } from '../components/Header';
import I18n from '../locale/I18n';
import './help.scss';

const baseUrl = () => "https://notifications.example.surfconext.nl/";

const RESPONSE = `[
  {
    "id": 8,
    "startAt": "2026-11-19T23:00:00Z",
    "endsAt": "2026-11-27T22:59:59Z",
    "creator": "jane.doe@example.com",
    "text": "<p>Planned <strong>maintenance</strong> tonight</p>\\n",
    "format": "html"
  }
]`;

export default function Help() {
    const url = `${baseUrl()}/api/external/notifications`;

    return (
        <>
            <Header />
            <main className="page page-wide help" data-testid="help">
                <h1>{I18n.t('help.apiTitle')}</h1>

                <p>{I18n.t('help.intro')}</p>
                <p>{I18n.t('help.auth')}</p>

                <h3>{I18n.t('help.requestTitle')}</h3>
                <p>{I18n.t('help.htmlDescription')}</p>
                <pre>
                    <code>{`curl -u myconext:password "${url}"`}</code>
                </pre>
                <p>{I18n.t('help.markdownDescription')}</p>
                <pre>
                    <code>{`curl -u myconext:password "${url}?format=markdown"`}</code>
                </pre>

                <h3>{I18n.t('help.responseTitle')}</h3>
                <pre>
                    <code>{RESPONSE}</code>
                </pre>
                <p>{I18n.t('help.unauthorized')}</p>

                <h2>{I18n.t('help.howTitle')}</h2>
                <ul>
                    <li>{I18n.t('help.howSource')}</li>
                    <li>{I18n.t('help.howCleanup')}</li>
                </ul>
            </main>
        </>
    );
}
