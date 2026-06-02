/**
 * IngestionProvider — turns a raw external message/media into a draft bill.
 *
 * v1 ships only UploadLinkProvider (parent/child/helper uploads via the app's
 * upload form). WhatsApp Business API arrives later as a sibling implementation
 * with no caller changes — see Decision 11.
 */

export interface RawIngestionInput {
  source: 'upload-link' | 'whatsapp' | 'email';
  householdId: number;
  submittedByMemberId: number;
  title: string;
  amountMinor: number;
  currency: string;
  dueDate: Date;
  attachmentUrl: string;
  attachmentKind?: 'image' | 'pdf' | 'text';
  rawText?: string;
}

export interface DraftBill {
  householdId: number;
  submittedByMemberId: number;
  title: string;
  amountMinor: number;
  currency: string;
  dueDate: Date;
  attachmentUrl: string;
  attachmentKind: 'image' | 'pdf' | 'text';
}

export interface IngestionProvider {
  readonly source: RawIngestionInput['source'];
  ingest(input: RawIngestionInput): Promise<DraftBill>;
}

export class UploadLinkProvider implements IngestionProvider {
  readonly source = 'upload-link' as const;

  async ingest(input: RawIngestionInput): Promise<DraftBill> {
    if (!input.attachmentUrl) {
      throw new Error('upload-link ingestion requires an attachmentUrl');
    }
    if (!input.title.trim()) {
      throw new Error('upload-link ingestion requires a bill title');
    }
    if (!Number.isFinite(input.amountMinor) || input.amountMinor <= 0) {
      throw new Error('upload-link ingestion requires a positive amount');
    }

    return {
      householdId: input.householdId,
      submittedByMemberId: input.submittedByMemberId,
      title: input.title.trim(),
      amountMinor: Math.round(input.amountMinor),
      currency: input.currency || 'INR',
      dueDate: input.dueDate,
      attachmentUrl: input.attachmentUrl,
      attachmentKind: input.attachmentKind ?? 'image'
    };
  }
}

export const uploadLinkProvider = new UploadLinkProvider();

const providers = new Map<RawIngestionInput['source'], IngestionProvider>();
providers.set(uploadLinkProvider.source, uploadLinkProvider);

export function getIngestionProvider(
  source: RawIngestionInput['source']
): IngestionProvider {
  const p = providers.get(source);
  if (!p) {
    throw new Error(
      `No ingestion provider registered for source "${source}" — only "upload-link" is enabled in v1.`
    );
  }
  return p;
}
