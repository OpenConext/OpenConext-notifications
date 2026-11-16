import { Suspense, lazy, useState } from 'react';

import {
    Button,
    Input,
    Label,
    NativeSelect,
    NativeSelectOption,
    Spinner,
} from '@surfnet/curve-react';

import type { NotificationInput } from '../api/notifications';
import I18n from '../locale/I18n';
import { useConfigStore } from '../store/config';

// the editor is big, it is only loaded when a notification is created or edited
const MDEditor = lazy(() => import('@uiw/react-md-editor'));

// <input type="datetime-local"> works with local time without zone
const toLocalInput = (iso: string) => {
    const date = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const defaultStart = () => toLocalInput(new Date().toISOString());
const defaultEnd = () =>
    toLocalInput(new Date(Date.now() + 24 * 3600 * 1000).toISOString());

type Props = {
    initial?: NotificationInput;
    saving: boolean;
    onSave: (input: NotificationInput) => void;
    onCancel: () => void;
};

export const NotificationForm = ({
    initial,
    saving,
    onSave,
    onCancel,
}: Props) => {
    const targetApps = useConfigStore(
        (state) => state.config?.targetApps ?? [],
    );
    const [targetApp, setTargetApp] = useState(
        initial?.targetApp ?? targetApps[0] ?? '',
    );
    const [startAt, setStartAt] = useState(
        initial ? toLocalInput(initial.startAt) : defaultStart(),
    );
    const [endsAt, setEndsAt] = useState(
        initial ? toLocalInput(initial.endsAt) : defaultEnd(),
    );
    const [text, setText] = useState(initial?.htmlText ?? '');

    const validPeriod = new Date(endsAt) > new Date(startAt);
    const valid = validPeriod && text.trim() !== '' && targetApp !== '';

    return (
        <form
            className="form"
            onSubmit={(e) => {
                e.preventDefault();
                onSave({
                    targetApp,
                    htmlText: text,
                    startAt: new Date(startAt).toISOString(),
                    endsAt: new Date(endsAt).toISOString(),
                });
            }}
        >
            <div className="field">
                <Label htmlFor="targetApp">
                    {I18n.t('notifications.form.targetApp')}
                </Label>
                <NativeSelect
                    id="targetApp"
                    data-testid="form-target-app"
                    value={targetApp}
                    onChange={(e) => setTargetApp(e.target.value)}
                >
                    {targetApps.map((app) => (
                        <NativeSelectOption key={app} value={app}>
                            {app}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>
            </div>
            <div className="dates">
                <div className="field">
                    <Label htmlFor="startAt">
                        {I18n.t('notifications.form.startAt')}
                    </Label>
                    <Input
                        id="startAt"
                        type="datetime-local"
                        data-testid="form-start-at"
                        value={startAt}
                        onChange={(e) => setStartAt(e.target.value)}
                    />
                </div>
                <div className="field">
                    <Label htmlFor="endsAt">
                        {I18n.t('notifications.form.endsAt')}
                    </Label>
                    <Input
                        id="endsAt"
                        type="datetime-local"
                        data-testid="form-ends-at"
                        value={endsAt}
                        onChange={(e) => setEndsAt(e.target.value)}
                    />
                </div>
            </div>
            {!validPeriod && (
                <div role="alert" data-testid="form-invalid-period">
                    {I18n.t('notifications.form.invalidPeriod')}
                </div>
            )}
            <div
                className="field"
                data-color-mode="light"
                data-testid="form-text"
            >
                <Label>{I18n.t('notifications.form.text')}</Label>
                {/* the most popular markdown editor, with live preview */}
                <Suspense fallback={<Spinner />}>
                    <MDEditor
                        value={text}
                        onChange={(value) => setText(value ?? '')}
                        preview="live"
                        height={320}
                        textareaProps={{
                            'aria-label': I18n.t('notifications.form.text'),
                        }}
                    />
                </Suspense>
            </div>
            <div className="actions">
                <Button
                    type="submit"
                    data-testid="form-save"
                    disabled={!valid || saving}
                >
                    {I18n.t('common.save')}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    data-testid="form-cancel"
                    onClick={onCancel}
                >
                    {I18n.t('common.cancel')}
                </Button>
            </div>
        </form>
    );
};
