/**
 * Lead Service - Manages quote/contact form submissions
 * DRY: Reuses FirestoreService pattern from firestore.service.ts
 */

import { leadsService } from './firestore.service';
import type { Lead } from '../firebase/types';

/**
 * Create a new lead from the Hero / quote forms.
 *
 * This posts to the /api/quote endpoint (Admin SDK) which BOTH saves the lead
 * to the `leads` collection AND sends an email notification via Resend.
 * (Writing straight to Firestore from the client would skip the email.)
 */
export async function createLead(data: {
  name: string;
  material: string;
  quantity: string;
  contact: string;
}): Promise<void> {
  const language =
    typeof document !== 'undefined' && document.documentElement.lang === 'es'
      ? 'es'
      : 'en';

  const response = await fetch('/api/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, language }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || 'Failed to submit quote request');
  }
}

/**
 * Get all leads ordered by creation date (newest first)
 * DRY: Reuses leadsService.getAllOrdered()
 */
export async function getAllLeads(): Promise<Lead[]> {
  return leadsService.getAllOrdered('createdAt', 'desc');
}

/**
 * Update lead status
 */
export async function updateLeadStatus(
  leadId: string,
  status: Lead['status'],
  notes?: string
): Promise<void> {
  const update: Partial<Lead> = { status };
  if (notes !== undefined) update.notes = notes;
  await leadsService.update(leadId, update);
}

/**
 * Delete a lead
 * DRY: Reuses leadsService.delete()
 */
export async function deleteLead(leadId: string): Promise<void> {
  await leadsService.delete(leadId);
}
