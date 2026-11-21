import { Suspense, lazy, useState } from 'react';

import rehypeSanitize from 'rehype-sanitize';

import {
    Button,
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    DatePickerInput,
    Label,
    Spinner,
} from '@surfnet/curve-react';

import type { NotificationInput } from '../api/notifications';
import I18n from '../locale/I18n';
import { previewSchema } from '../markdown/previewSchema';
import { useConfigStore } from '../store/config';

// the editor is big, it is only loaded when a notification is created or edited
const MDEditor = lazy(() => import('@uiw/react-md-editor'));

const pad = (n: number) => String(n).padStart(2, '0');

// dates are shown and typed as dd-mm-yyyy
const formatDate = (date: Date) =>
    `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;

const parseDate = (value: string): Date | undefined => {
    const match = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(value.trim());
    if (!match) {
        return undefined;
    }
    const [day, month, year] = match.slice(1).map(Number);
    const date = new Date(year, month - 1, day);
    return date.getMonth() === month - 1 && date.getDate() === day
        ? date
        : undefined;
};

const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

const today = () => startOfDay(new Date());
const defaultEnd = () => {
    const date = today();
    date.setDate(date.getDate() + 5);
    return date;
};

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
    const [targetApp, setTargetApp] = useState<string | null>(
        initial?.targetApp ?? null,
    );
    const [submitted, setSubmitted] = useState(false);
    const initialStart = initial
        ? startOfDay(new Date(initial.startAt))
        : undefined;
    const [startDate, setStartDate] = useState<Date | undefined>(
        initialStart ?? today(),
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        initial ? startOfDay(new Date(initial.endsAt)) : defaultEnd(),
    );
    // the end can never be before the start: move it along with the start
    const changeStart = (date: Date | undefined) => {
        setStartDate(date);
        if (date && endDate && endDate < date) {
            setEndDate(date);
        }
    };
    const [text, setText] = useState(initial?.htmlText ?? '');

    const validPeriod =
        startDate !== undefined &&
        endDate !== undefined &&
        endDate >= startDate;
    const appMissing = !targetApp;
    const textMissing = text.trim() === '';
    // an existing notification may keep a start date that has passed since
    const startInPast =
        startDate !== undefined &&
        startDate < today() &&
        startDate.getTime() !== initialStart?.getTime();
    const valid = validPeriod && !startInPast && !textMissing && !appMissing;

    return (
        <form
            className="form"
            onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
                if (!valid || !startDate || !endDate || !targetApp) {
                    return;
                }
                onSave({
                    targetApp,
                    htmlText: text,
                    startAt: startOfDay(startDate).toISOString(),
                    endsAt: endOfDay(endDate).toISOString(),
                });
            }}
        >
            <div className="field">
                <Label htmlFor="targetApp">
                    {I18n.t('notifications.form.targetApp')}
                </Label>
                <Combobox
                    items={targetApps}
                    value={targetApp}
                    onValueChange={(value) =>
                        setTargetApp(value as string | null)
                    }
                >
                    <div className="combobox">
                        <ComboboxInput
                            id="targetApp"
                            data-testid="form-target-app"
                            showClear={false}
                            placeholder={I18n.t(
                                'notifications.form.targetAppPlaceholder',
                            )}
                            aria-invalid={submitted && appMissing}
                        />
                    </div>
                    <ComboboxContent>
                        <ComboboxEmpty>
                            {I18n.t('notifications.form.noApplications')}
                        </ComboboxEmpty>
                        <ComboboxList>
                            {(app: string) => (
                                <ComboboxItem key={app} value={app}>
                                    {app}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
                {submitted && appMissing && (
                    <div
                        role="alert"
                        className="field-error"
                        data-testid="form-target-app-error"
                    >
                        {I18n.t('notifications.form.targetAppRequired')}
                    </div>
                )}
            </div>
            <div className="dates">
                <div className="field">
                    <Label htmlFor="startAt">
                        {I18n.t('notifications.form.startAt')}
                    </Label>
                    <DatePickerInput
                        id="startAt"
                        data-testid="form-start-at"
                        date={startDate}
                        onDateChange={changeStart}
                        calendarProps={{
                            disabled: { before: today() },
                        }}
                        showClear={false}
                        formatDate={formatDate}
                        parseDate={parseDate}
                    />
                </div>
                <div className="field">
                    <Label htmlFor="endsAt">
                        {I18n.t('notifications.form.endsAt')}
                    </Label>
                    <DatePickerInput
                        id="endsAt"
                        data-testid="form-ends-at"
                        date={endDate}
                        onDateChange={setEndDate}
                        calendarProps={{
                            disabled: { before: startDate ?? today() },
                        }}
                        showClear={false}
                        formatDate={formatDate}
                        parseDate={parseDate}
                    />
                </div>
            </div>
            {startInPast && (
                <div role="alert" data-testid="form-start-in-past">
                    {I18n.t('notifications.form.startInPast')}
                </div>
            )}
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
                        previewOptions={{
                            rehypePlugins: [[rehypeSanitize, previewSchema]],
                        }}
                        height={320}
                        textareaProps={{
                            'aria-label': I18n.t('notifications.form.text'),
                        }}
                    />
                </Suspense>
                {submitted && textMissing && (
                    <div
                        role="alert"
                        className="field-error"
                        data-testid="form-text-error"
                    >
                        {I18n.t('notifications.form.textRequired')}
                    </div>
                )}
            </div>
            <div className="actions">
                <Button
                    type="button"
                    variant="outline"
                    data-testid="form-cancel"
                    onClick={onCancel}
                >
                    {I18n.t('common.cancel')}
                </Button>
                <Button
                    type="submit"
                    data-testid="form-save"
                    disabled={(submitted && !valid) || saving}
                >
                    {I18n.t('common.save')}
                </Button>
            </div>
        </form>
    );
};
