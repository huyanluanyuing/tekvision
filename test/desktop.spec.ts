import { test, expect } from '@playwright/test';

const API_BASE_URL = 'https://takehome-desktop.d.tekvisionflow.com';
const DESKTOP_PATH = process.env.DESKTOP_PATH || '/desktop';

// Clean scenarios: Only containing data we explicitly send and control
const testScenarios = [
  { name: 'Billing Dispute', account: '10001', journey: 'Billing Support', auth: 'Authenticated', expectProfile: true },
  { name: 'Unauthenticated Inquiry', account: '00000', journey: 'General Account Inquiry', auth: 'Not Authenticated', expectProfile: false },
  { name: 'VIP Retention Case', account: '10012', journey: 'Retention Review', auth: 'Authenticated', expectProfile: true },
  { name: 'Payment Failure Follow-up', account: '10024', journey: 'Collections Support', auth: 'Authenticated', expectProfile: true },
  { name: 'Profile Maintenance', account: '10035', journey: 'Profile Confirmation', auth: 'Authenticated', expectProfile: true }
];

test.describe('Agent Desktop - Data Integrity Matrix', () => {

  for (const data of testScenarios) {
    test(`Verify Scenario: ${data.name}`, async ({ request, page }) => {
      
      const payload = {
        "interactionInformation": {
          "interactionId": `CHAT-${Date.now()}`,
          "channel": "Chat",
          "authenticationStatus": data.auth,
          "customerAccountNumber": data.account,
          "journeyName": data.journey,
          "queueName": "Standard Queue",
          "agentDesktopStatus": "Connected",
          "startTime": new Date().toISOString()
        },
        "chatTranscript": [{ "sender": "Customer", "timestamp": "12:00:00", "message": `Test msg for ${data.name}` }]
      };

      const response = await request.post(`${API_BASE_URL}/api/testrun`, { data: payload });
      expect(response.ok()).toBe(true);
      const { runId } = await response.json();

      await page.goto(`${API_BASE_URL}${DESKTOP_PATH}/${runId}`);
      await page.getByTestId('agent-status-select').selectOption('Ready');
      await page.getByRole('button', { name: /Accept/i }).click();

      // Professional Assertion Strategy:
      // We only verify the fields we provided in the Payload.
      if (data.expectProfile) {
        await page.getByText('Customer Profile').first().click();
        
        // Assert the Account Number matches our payload
        await expect(page.locator('body')).toContainText(data.account);
        
        // Assert the Journey matches our payload (Note: verify it's visible in Interaction tab first)
        await page.getByText('Interaction Information').first().click();
        await expect(page.locator('body')).toContainText(data.journey);
      } else {
        await page.getByText('Customer Profile').first().click();
        await expect(page.locator('body')).toContainText('Customer profile unavailable until authenticated');
      }
    });
  }

  // The primary goal: detect the badge bug
  test('BUG DETECTION: Message badge count freezes at 35', async ({ request, page }) => {
    const totalMsgs = 40;
    const payload = {
      "interactionInformation": {
        "interactionId": `BUG-${Date.now()}`,
        "channel": "Chat",
        "authenticationStatus": "Authenticated",
        "customerAccountNumber": "10012",
        "journeyName": "Bug Hunt",
        "queueName": "QA Queue",
        "agentDesktopStatus": "Connected",
        "startTime": new Date().toISOString()
      },
      "chatTranscript": Array.from({ length: totalMsgs }, (_, i) => ({
        "sender": "Customer", "timestamp": "12:00", "message": `Msg ${i}`
      }))
    };

    const response = await request.post(`${API_BASE_URL}/api/testrun`, { data: payload });
    const { runId } = await response.json();
    await page.goto(`${API_BASE_URL}${DESKTOP_PATH}/${runId}`);
    await page.getByTestId('agent-status-select').selectOption('Ready');
    await page.getByRole('button', { name: /Accept/i }).click();

    await expect(page.locator('.panel-badge')).toHaveText(`${totalMsgs} messages`);
  });
});