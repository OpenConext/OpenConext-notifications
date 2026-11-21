interface NotificationIconProps {
    count: number;
    label: string;
}

const MAX_COUNT = 99;

/** Bell app icon with a red badge showing the number of notifications. */
export const NotificationIcon = ({ count, label }: NotificationIconProps) => {
    const text = count > MAX_COUNT ? `${MAX_COUNT}+` : String(count);
    const fontSize = text.length === 1 ? 92 : text.length === 2 ? 74 : 58;

    return (
        <svg
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={label}
            data-testid="notification-icon"
        >
            <defs>
                <linearGradient id="ni-bg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f6f6f6" />
                    <stop offset="1" stopColor="#dcdcdc" />
                </linearGradient>
                <linearGradient id="ni-bell" x1="0" y1="1" x2="1" y2="0">
                    <stop
                        offset="0"
                        style={{ stopColor: 'var(--primary-strong)' }}
                    />
                    <stop
                        offset="0.5"
                        style={{ stopColor: 'var(--primary)' }}
                    />
                    <stop
                        offset="1"
                        style={{ stopColor: 'var(--secondary)' }}
                    />
                </linearGradient>
                <radialGradient id="ni-glow" cx="0.35" cy="0.4" r="0.45">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
                <clipPath id="ni-bell-clip">
                    <path d="M256 82c-16 0-27 9-27 24 0 3 0 6 1 8-52 14-84 62-84 125 0 78-26 112-72 148-4 3-2 10 3 10h358c5 0 7-7 3-10-46-36-72-70-72-148 0-63-32-111-84-125 1-2 1-5 1-8 0-15-11-24-27-24Z" />
                </clipPath>
            </defs>
            <rect width="512" height="512" rx="96" fill="url(#ni-bg)" />
            <path
                d="M256 82c-16 0-27 9-27 24 0 3 0 6 1 8-52 14-84 62-84 125 0 78-26 112-72 148-4 3-2 10 3 10h358c5 0 7-7 3-10-46-36-72-70-72-148 0-63-32-111-84-125 1-2 1-5 1-8 0-15-11-24-27-24Z"
                fill="url(#ni-bell)"
            />
            <rect
                width="512"
                height="512"
                fill="url(#ni-glow)"
                clipPath="url(#ni-bell-clip)"
            />
            <path
                d="M205 400h102c0 30-23 52-51 52s-51-22-51-52Z"
                fill="var(--primary)"
            />
            {count > 0 && (
                <g data-testid="notification-badge">
                    <circle cx="390" cy="122" r="76" fill="#fff" />
                    <circle cx="390" cy="122" r="64" fill="#e82127" />
                    <text
                        x="390"
                        y="122"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontFamily="Helvetica, Arial, sans-serif"
                        fontWeight="500"
                        fontSize={fontSize}
                        fill="#fff"
                    >
                        {text}
                    </text>
                </g>
            )}
        </svg>
    );
};
