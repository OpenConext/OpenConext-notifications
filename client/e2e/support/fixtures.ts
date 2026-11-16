import { test as base, expect } from '@playwright/test';

type Notification = { id: number };

type Fixtures = {
    // starts every test without notifications
    clean: void;
};

export const test = base.extend<Fixtures>({
    clean: [
        async ({ request }, provide) => {
            const response = await request.get('/api/notifications');
            expect(response.ok()).toBeTruthy();
            for (const { id } of (await response.json()) as Notification[]) {
                const cookies = await request.storageState();
                const xsrf = cookies.cookies.find(
                    (c) => c.name === 'XSRF-TOKEN',
                );
                const deleted = await request.delete(
                    `/api/notifications/${id}`,
                    {
                        headers: xsrf ? { 'X-XSRF-TOKEN': xsrf.value } : {},
                    },
                );
                expect(deleted.ok()).toBeTruthy();
            }
            await provide();
        },
        { auto: true },
    ],
});

export { expect };
