// Easter egg: on logout the screen cracks like broken glass and the shards fall
// away. It lasts two seconds, after which the overlay is removed and the logged
// out page is all that is left.

const DURATION = 1600;
const CRACK = 250; // ms the screen only shows cracks, before the shards let go
const FADE = 400; // ms at the end in which the glass fades out

type Point = { x: number; y: number };

type Shard = {
    points: Point[];
    cx: number;
    cy: number;
    vx: number;
    vy: number;
    spin: number;
    sheen: number; // varies the direction of the glass sheen per shard
    delay: number; // ms after the cracks, shards near the impact let go first
};

// a spiderweb of triangles around the impact point looks like cracked glass:
// radial cracks plus rings that get wider the further away from the impact
const buildShards = (width: number, height: number): Shard[] => {
    const impact = { x: width * (0.3 + Math.random() * 0.4), y: height * 0.4 };
    const farthest = Math.hypot(width, height);
    const rays = 24;
    const clamp = (p: Point): Point => ({
        x: Math.min(width, Math.max(0, p.x)),
        y: Math.min(height, Math.max(0, p.y)),
    });
    const angles = Array.from(
        { length: rays },
        (_, i) => ((i + (Math.random() - 0.5) * 0.7) / rays) * Math.PI * 2,
    );
    // rings, the last one lies outside the screen so everything is covered
    const rings: Point[][] = [];
    for (let r = 22; r < farthest * 1.2; r *= 1.45) {
        rings.push(
            angles.map((angle) => {
                const radius = r * (0.8 + Math.random() * 0.4);
                return clamp({
                    x: impact.x + Math.cos(angle) * radius,
                    y: impact.y + Math.sin(angle) * radius,
                });
            }),
        );
    }
    const shards: Shard[] = [];
    const add = (points: Point[]) => {
        const cx = (points[0].x + points[1].x + points[2].x) / 3;
        const cy = (points[0].y + points[1].y + points[2].y) / 3;
        const dx = cx - impact.x;
        const dy = cy - impact.y;
        const dist = Math.hypot(dx, dy) || 1;
        const push = 1 + Math.random() * 3;
        shards.push({
            points,
            cx,
            cy,
            vx: (dx / dist) * push * 60,
            vy: (dy / dist) * push * 60 - 80,
            spin: (Math.random() - 0.5) * 6,
            sheen: (Math.random() - 0.5) * 200,
            delay: (dist / farthest) * 350 + Math.random() * 120,
        });
    };
    for (let i = 0; i < rays; i++) {
        const next = (i + 1) % rays;
        add([impact, rings[0][i], rings[0][next]]);
        for (let k = 0; k < rings.length - 1; k++) {
            const a = rings[k][i];
            const b = rings[k][next];
            const c = rings[k + 1][i];
            const d = rings[k + 1][next];
            add([a, d, c]);
            add([a, b, d]);
        }
    }
    return shards;
};

const tracePath = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.closePath();
};

/**
 * Loads the effect lazily and takes a snapshot of the current screen. Resolves
 * with a function that starts the animation, or null when the effect is skipped
 * or fails: the logout itself must never depend on an easter egg.
 */
export const prepareLogoutEffect = async (): Promise<
    (() => Promise<void>) | null
> => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return null;
    }
    try {
        const { default: html2canvas } = await import('html2canvas-pro');
        const width = window.innerWidth;
        const height = window.innerHeight;
        const snapshot = await html2canvas(document.body, {
            scale: 1,
            width,
            height,
            x: window.scrollX,
            y: window.scrollY,
            logging: false,
            backgroundColor: getComputedStyle(document.body).backgroundColor,
        });
        return () => play(snapshot, width, height);
    } catch {
        return null;
    }
};

const play = (
    snapshot: HTMLCanvasElement,
    width: number,
    height: number,
): Promise<void> =>
    new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.setAttribute('aria-hidden', 'true');
        canvas.style.cssText =
            'position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483647;pointer-events:none;';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            canvas.remove();
            resolve();
            return;
        }

        const shards = buildShards(width, height);
        const start = performance.now();

        const frame = (now: number) => {
            const t = now - start;
            if (t >= DURATION) {
                canvas.remove();
                resolve();
                return;
            }

            ctx.clearRect(0, 0, width, height);

            const fall = Math.max(0, t - CRACK);
            shards.forEach((s) => {
                const age = Math.max(0, (fall - s.delay) / 1000);
                const x = s.vx * age;
                const y = s.vy * age + 1400 * age * age; // gravity
                // intact glass is already slightly shifted, so the cracks show
                const angle = s.spin * (age + 0.004);
                ctx.save();
                ctx.translate(s.cx + x, s.cy + y);
                ctx.rotate(angle);
                ctx.translate(-s.cx, -s.cy);

                tracePath(ctx, s.points);
                ctx.save();
                ctx.clip();
                // intact glass shows the page, loose glass turns see-through
                ctx.globalAlpha = 1 - 0.55 * Math.min(1, age * 4);
                ctx.drawImage(snapshot, 0, 0, width, height);
                ctx.globalAlpha = 1;
                // a cold glassy sheen across every shard, in its own direction
                const sheen = ctx.createLinearGradient(
                    s.points[0].x,
                    s.points[0].y,
                    s.points[1].x + s.sheen,
                    s.points[2].y,
                );
                sheen.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
                sheen.addColorStop(0.5, 'rgba(190, 225, 255, 0.04)');
                sheen.addColorStop(1, 'rgba(150, 200, 240, 0.12)');
                ctx.fillStyle = sheen;
                ctx.fillRect(0, 0, width, height);
                ctx.restore();

                // dark gap between the pieces, then a bright glass edge on top
                tracePath(ctx, s.points);
                ctx.lineJoin = 'round';
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
                ctx.stroke();
                ctx.lineWidth = 0.8;
                ctx.strokeStyle = 'rgba(235, 248, 255, 0.9)';
                ctx.stroke();
                ctx.restore();
            });

            // fade the whole overlay away, revealing the logged out page
            const fadeStart = DURATION - FADE;
            canvas.style.opacity = String(
                t > fadeStart ? 1 - (t - fadeStart) / FADE : 1,
            );

            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    });
