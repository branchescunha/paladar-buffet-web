import { expect, test } from '@playwright/test';

test('keeps quote form controls aligned on desktop and mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/orcamento');

  const name = page.getByLabel('Nome completo');
  const phone = page.getByLabel('WhatsApp ou telefone');
  const eventType = page.getByLabel('Tipo de evento');
  const eventDate = page.getByLabel('Data prevista');
  const eventTime = page.getByLabel('Horário previsto');
  const guestCount = page.getByLabel('Quantidade estimada de convidados');

  await expect(name).toBeVisible();
  await expect(phone).toBeVisible();
  await expect(eventDate).toBeVisible();
  await expect(eventTime).toBeVisible();
  await expect(guestCount).toBeVisible();

  const desktop = await page.evaluate(() => {
    const controls = [
      document.querySelector('#fullName'),
      document.querySelector('#phone'),
      document.querySelector('#eventType'),
      document.querySelector('#eventDate'),
      document.querySelector('#eventTime'),
      document.querySelector('#guestCount')
    ].map((element) => {
      if (!(element instanceof HTMLElement)) {
        throw new Error('Expected quote form control was not found');
      }
      return element.getBoundingClientRect();
    });

    const [nameBox, phoneBox, eventTypeBox, eventDateBox, eventTimeBox, guestCountBox] = controls;

    return {
      pairedWidthDelta: Math.max(
        Math.abs(nameBox.width - phoneBox.width),
        Math.abs(eventDateBox.width - eventTimeBox.width)
      ),
      controlHeightDelta: Math.max(
        Math.abs(nameBox.height - phoneBox.height),
        Math.abs(eventTypeBox.height - eventDateBox.height),
        Math.abs(eventTimeBox.height - guestCountBox.height)
      ),
      pairedTopDelta: Math.max(Math.abs(nameBox.top - phoneBox.top), Math.abs(eventDateBox.top - eventTimeBox.top)),
      eventTypeSpanWidth: eventTypeBox.width,
      rowControlWidth: eventDateBox.width
    };
  });

  expect(desktop.pairedWidthDelta).toBeLessThanOrEqual(1);
  expect(desktop.controlHeightDelta).toBeLessThanOrEqual(1);
  expect(desktop.pairedTopDelta).toBeLessThanOrEqual(1);
  expect(desktop.eventTypeSpanWidth).toBeGreaterThan(desktop.rowControlWidth * 1.95);

  await eventType.selectOption('outro');
  const otherType = page.getByLabel('Outro tipo de evento');
  await expect(otherType).toBeVisible();

  const customType = await page.evaluate(() => {
    const eventTypeElement = document.querySelector('#eventType');
    const otherTypeElement = document.querySelector('#eventTypeOther');

    if (!(eventTypeElement instanceof HTMLElement) || !(otherTypeElement instanceof HTMLElement)) {
      throw new Error('Custom event type controls were not found');
    }

    const eventTypeBox = eventTypeElement.getBoundingClientRect();
    const otherTypeBox = otherTypeElement.getBoundingClientRect();

    return {
      widthDelta: Math.abs(eventTypeBox.width - otherTypeBox.width),
      topDelta: Math.abs(eventTypeBox.top - otherTypeBox.top),
      heightDelta: Math.abs(eventTypeBox.height - otherTypeBox.height)
    };
  });

  expect(customType.widthDelta).toBeLessThanOrEqual(1);
  expect(customType.topDelta).toBeLessThanOrEqual(1);
  expect(customType.heightDelta).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  const mobile = await page.evaluate(() => {
    const form = document.querySelector('form');
    const controls = [
      document.querySelector('#fullName'),
      document.querySelector('#phone'),
      document.querySelector('#eventType'),
      document.querySelector('#eventDate'),
      document.querySelector('#eventTime'),
      document.querySelector('#guestCount')
    ];

    if (!(form instanceof HTMLElement)) {
      throw new Error('Quote form was not found');
    }

    const formBox = form.getBoundingClientRect();
    const controlBoxes = controls.map((element) => {
      if (!(element instanceof HTMLElement)) {
        throw new Error('Expected mobile quote form control was not found');
      }
      return element.getBoundingClientRect();
    });

    return {
      formRight: formBox.right,
      viewportWidth: window.innerWidth,
      uniqueLefts: new Set(controlBoxes.map((box) => Math.round(box.left))).size,
      maxRight: Math.max(...controlBoxes.map((box) => box.right)),
      minWidth: Math.min(...controlBoxes.map((box) => box.width)),
      maxWidth: Math.max(...controlBoxes.map((box) => box.width))
    };
  });

  expect(mobile.uniqueLefts).toBe(1);
  expect(mobile.maxRight).toBeLessThanOrEqual(mobile.viewportWidth);
  expect(mobile.maxRight).toBeLessThanOrEqual(mobile.formRight + 1);
  expect(mobile.maxWidth - mobile.minWidth).toBeLessThanOrEqual(1);
});
