import { expect, test } from './support/fixtures';

// the first target app of application.yml
const TARGET_APP = 'myconext';
const BASIC = `Basic ${Buffer.from(`${TARGET_APP}:secret`).toString('base64')}`;

const fillText = async (
    page: import('@playwright/test').Page,
    text: string,
) => {
    await page.getByTestId('form-text').locator('textarea').fill(text);
};

test('create a notification with markdown preview and retrieve it server-to-server', async ({
    page,
    request,
}) => {
    await page.goto('/');
    await expect(page.getByTestId('empty')).toBeVisible();

    await page.getByTestId('new-notification').click();
    await page.getByTestId('form-target-app').selectOption(TARGET_APP);
    await fillText(page, 'Planned **maintenance** tonight');
    // live preview of the markdown component
    await expect(page.getByTestId('form-text').locator('strong')).toHaveText(
        'maintenance',
    );
    await page.getByTestId('form-save').click();

    await expect(page.getByTestId('notifications-table')).toContainText(
        'Planned **maintenance** tonight',
    );

    // the notification is active (starts now), so the target app gets it as HTML and markdown
    const html = await request.get('/api/external/notifications', {
        headers: { Authorization: BASIC },
    });
    expect(html.ok()).toBeTruthy();
    expect((await html.json())[0].text).toContain(
        '<p>Planned <strong>maintenance</strong> tonight</p>',
    );
    const markdown = await request.get(
        '/api/external/notifications?format=markdown',
        { headers: { Authorization: BASIC } },
    );
    expect((await markdown.json())[0].text).toBe(
        'Planned **maintenance** tonight',
    );
});

test('edit and delete a notification, then log out and log in again', async ({
    page,
}) => {
    await page.goto('/new');
    await fillText(page, 'First text');
    await page.getByTestId('form-save').click();
    await expect(page.getByTestId('notification-text')).toHaveText(
        'First text',
    );

    await page.getByTestId('notification-edit').click();
    await fillText(page, 'Second text');
    await page.getByTestId('form-save').click();
    await expect(page.getByTestId('notification-text')).toHaveText(
        'Second text',
    );

    await page.getByTestId('notification-delete').click();
    await page.getByTestId('notification-delete-confirm').click();
    await expect(page.getByTestId('empty')).toBeVisible();

    await page.getByTestId('logout').click();
    await expect(page.getByTestId('logged-out')).toBeVisible();
    await expect(page.getByTestId('login-again')).toBeVisible();
});
