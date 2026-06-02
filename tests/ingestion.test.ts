import { describe, test, expect } from 'bun:test';
import {
  getIngestionProvider,
  uploadLinkProvider
} from '../lib/ingestion/provider';

describe('IngestionProvider seam', () => {
  test('UploadLinkProvider is registered as upload-link', () => {
    expect(getIngestionProvider('upload-link')).toBe(uploadLinkProvider);
  });

  test('throws for unimplemented providers (whatsapp ships later)', () => {
    expect(() => getIngestionProvider('whatsapp' as never)).toThrow(
      /upload-link/
    );
  });

  test('UploadLinkProvider builds a draft bill', async () => {
    const draft = await uploadLinkProvider.ingest({
      source: 'upload-link',
      householdId: 1,
      submittedByMemberId: 2,
      title: '  Electricity  ',
      amountMinor: 124000,
      currency: 'INR',
      dueDate: new Date('2026-07-01'),
      attachmentUrl: '/u/r.jpg'
    });
    expect(draft.title).toBe('Electricity');
    expect(draft.amountMinor).toBe(124000);
    expect(draft.attachmentKind).toBe('image');
  });

  test('rejects bills without attachment', async () => {
    await expect(
      uploadLinkProvider.ingest({
        source: 'upload-link',
        householdId: 1,
        submittedByMemberId: 2,
        title: 'x',
        amountMinor: 100,
        currency: 'INR',
        dueDate: new Date(),
        attachmentUrl: ''
      })
    ).rejects.toThrow(/attachmentUrl/);
  });

  test('rejects bills with zero or negative amount', async () => {
    await expect(
      uploadLinkProvider.ingest({
        source: 'upload-link',
        householdId: 1,
        submittedByMemberId: 2,
        title: 'x',
        amountMinor: 0,
        currency: 'INR',
        dueDate: new Date(),
        attachmentUrl: '/x.jpg'
      })
    ).rejects.toThrow(/positive amount/);
  });

  test('rejects bills with empty title', async () => {
    await expect(
      uploadLinkProvider.ingest({
        source: 'upload-link',
        householdId: 1,
        submittedByMemberId: 2,
        title: '   ',
        amountMinor: 100,
        currency: 'INR',
        dueDate: new Date(),
        attachmentUrl: '/x.jpg'
      })
    ).rejects.toThrow(/title/);
  });
});
