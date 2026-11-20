import { useMemo, useState } from 'react';
import { Link } from 'react-router';

import { toast } from 'sonner';

import {
    CaretDownIcon,
    CaretUpDownIcon,
    CaretUpIcon,
    MagnifyingGlassIcon,
    PencilSimpleIcon,
    TrashIcon,
} from '@phosphor-icons/react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    buttonVariants,
} from '@surfnet/curve-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    type Notification,
    deleteNotification,
    fetchNotifications,
} from '../api/notifications';
import I18n from '../locale/I18n';

const PAGE_SIZE = 10;

type SortKey = 'targetApp' | 'startAt' | 'endsAt' | 'creator' | 'htmlText';
type Direction = 'asc' | 'desc';

const COLUMNS: SortKey[] = [
    'targetApp',
    'startAt',
    'endsAt',
    'creator',
    'htmlText',
];

const format = (iso: string) => new Date(iso).toLocaleString(I18n.locale);

const matches = (n: Notification, query: string) =>
    [
        n.targetApp,
        n.creator,
        n.htmlText,
        format(n.startAt),
        format(n.endsAt),
    ].some((value) => value.toLowerCase().includes(query));

const compare = (a: Notification, b: Notification, key: SortKey) =>
    key === 'startAt' || key === 'endsAt'
        ? new Date(a[key]).getTime() - new Date(b[key]).getTime()
        : a[key].localeCompare(b[key], I18n.locale, { sensitivity: 'base' });

const SortIcon = ({ active, dir }: { active: boolean; dir: Direction }) => {
    if (!active) {
        return <CaretUpDownIcon aria-hidden="true" />;
    }
    return dir === 'asc' ? (
        <CaretUpIcon aria-hidden="true" />
    ) : (
        <CaretDownIcon aria-hidden="true" />
    );
};

// an icon button or link with an accessible name and a tooltip on hover/focus
const IconAction = ({
    label,
    testId,
    render,
    children,
}: {
    label: string;
    testId?: string;
    render: React.ReactElement<Record<string, unknown>>;
    children: React.ReactNode;
}) => (
    <Tooltip>
        <TooltipTrigger render={render} aria-label={label} data-testid={testId}>
            {children}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
    </Tooltip>
);

export const NotificationsTable = () => {
    const queryClient = useQueryClient();
    const [confirming, setConfirming] = useState<number | null>(null);
    const [query, setQuery] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('startAt');
    const [direction, setDirection] = useState<Direction>('desc');
    const [page, setPage] = useState(0);
    const { data, isError } = useQuery({
        queryKey: ['notifications'],
        queryFn: fetchNotifications,
    });
    const remove = useMutation({
        mutationFn: deleteNotification,
        onSuccess: async () => {
            setConfirming(null);
            toast.success(I18n.t('notifications.deleted'));
            await queryClient.invalidateQueries({
                queryKey: ['notifications'],
            });
        },
    });

    const rows = useMemo(() => {
        const needle = query.trim().toLowerCase();
        const filtered = (data ?? []).filter(
            (n) => needle === '' || matches(n, needle),
        );
        const sign = direction === 'asc' ? 1 : -1;
        return filtered.sort((a, b) => sign * compare(a, b, sortKey));
    }, [data, query, sortKey, direction]);

    const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    // e.g. after deleting the last row of the last page
    const current = Math.min(page, pageCount - 1);
    const visible = rows.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

    const sortBy = (key: SortKey) => {
        if (key === sortKey) {
            setDirection(direction === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setDirection('asc');
        }
        setPage(0);
    };

    const goTo = (target: number) => (e: React.MouseEvent) => {
        e.preventDefault();
        setPage(target);
    };

    return (
        <>
            <div className="toolbar">
                <InputGroup className="search">
                    <InputGroupInput
                        type="search"
                        data-testid="search"
                        aria-label={I18n.t('common.search')}
                        placeholder={I18n.t('common.search')}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(0);
                        }}
                    />
                    <InputGroupAddon align="inline-end">
                        <MagnifyingGlassIcon aria-hidden="true" />
                    </InputGroupAddon>
                </InputGroup>
                <Link
                    to="/new"
                    data-testid="new-notification"
                    className={buttonVariants()}
                >
                    {I18n.t('notifications.new')}
                </Link>
            </div>
            {isError && <p role="alert">{I18n.t('common.error')}</p>}
            {data && data.length === 0 && (
                <p data-testid="empty">{I18n.t('notifications.empty')}</p>
            )}
            {data && data.length > 0 && (
                <TooltipProvider>
                    <div className="table-card">
                        <Table data-testid="notifications-table">
                            <TableHeader>
                                <TableRow>
                                    {COLUMNS.map((key) => (
                                        <TableHead
                                            key={key}
                                            aria-sort={
                                                key === sortKey
                                                    ? direction === 'asc'
                                                        ? 'ascending'
                                                        : 'descending'
                                                    : 'none'
                                            }
                                        >
                                            <button
                                                type="button"
                                                className="sort"
                                                data-testid={`sort-${key}`}
                                                onClick={() => sortBy(key)}
                                            >
                                                {I18n.t(
                                                    `notifications.columns.${key === 'htmlText' ? 'text' : key}`,
                                                )}
                                                <SortIcon
                                                    active={key === sortKey}
                                                    dir={direction}
                                                />
                                            </button>
                                        </TableHead>
                                    ))}
                                    <TableHead>
                                        {I18n.t(
                                            'notifications.columns.actions',
                                        )}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visible.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={COLUMNS.length + 1}
                                            data-testid="no-results"
                                        >
                                            {I18n.t('notifications.noResults')}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {visible.map((n) => (
                                    <TableRow
                                        key={n.id}
                                        data-testid={`notification-${n.id}`}
                                    >
                                        <TableCell>{n.targetApp}</TableCell>
                                        <TableCell>
                                            {format(n.startAt)}
                                        </TableCell>
                                        <TableCell>
                                            {format(n.endsAt)}
                                        </TableCell>
                                        <TableCell>{n.creator}</TableCell>
                                        <TableCell data-testid="notification-text">
                                            {n.htmlText.length > 80
                                                ? `${n.htmlText.substring(0, 80)}…`
                                                : n.htmlText}
                                        </TableCell>
                                        <TableCell>
                                            <div className="row-actions">
                                                <IconAction
                                                    label={I18n.t(
                                                        'common.edit',
                                                    )}
                                                    testId="notification-edit"
                                                    render={
                                                        <Link
                                                            to={`/edit/${n.id}`}
                                                            className={buttonVariants(
                                                                {
                                                                    variant:
                                                                        'outline',
                                                                    size: 'icon',
                                                                },
                                                            )}
                                                        />
                                                    }
                                                >
                                                    <PencilSimpleIcon aria-hidden="true" />
                                                </IconAction>
                                                <IconAction
                                                    label={I18n.t(
                                                        'common.delete',
                                                    )}
                                                    testId="notification-delete"
                                                    render={
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() =>
                                                                setConfirming(
                                                                    n.id,
                                                                )
                                                            }
                                                        />
                                                    }
                                                >
                                                    <TrashIcon aria-hidden="true" />
                                                </IconAction>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TooltipProvider>
            )}
            <AlertDialog
                open={confirming !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirming(null);
                    }
                }}
            >
                <AlertDialogContent data-testid="delete-dialog">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {I18n.t('notifications.deleteTitle')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {I18n.t('notifications.deleteDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel data-testid="notification-delete-cancel">
                            {I18n.t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            data-testid="notification-delete-confirm"
                            onClick={() =>
                                confirming !== null && remove.mutate(confirming)
                            }
                        >
                            {I18n.t('common.confirmDelete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {pageCount > 1 && (
                <Pagination className="pagination" data-testid="pagination">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                text={I18n.t('common.previous')}
                                aria-disabled={current === 0}
                                onClick={goTo(Math.max(0, current - 1))}
                            />
                        </PaginationItem>
                        {Array.from({ length: pageCount }, (_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    href="#"
                                    isActive={i === current}
                                    onClick={goTo(i)}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                text={I18n.t('common.next')}
                                aria-disabled={current === pageCount - 1}
                                onClick={goTo(
                                    Math.min(pageCount - 1, current + 1),
                                )}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </>
    );
};
