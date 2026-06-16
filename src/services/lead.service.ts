/**
 * Lead Service - Manages quote/contact form submissions
 * DRY: Reuses FirestoreService pattern from firestore.service.ts
 */

import { leadsService } from './firestore.service';
import type { Lead } from '../firebase/types';
import { Timestamp } from 'firebase/firestore';

/**
 * Create a new lead from the Hero quote form
 */
export async function createLead(data: {
  name: string;
  material: string;
  quantity: string;
  contact: string;
}): Promise<string> {
  const leadData: Omit<Lead, 'id'> = {
    ...data,
    status: 'new',
    createdAt: Timestamp.now(),
  };
  return leadsService.create(leadData);
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
