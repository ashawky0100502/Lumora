import { supabaseClient } from './supabaseClient';

const DEFAULT_PRICES = {
  midnight: 350,
  silk: 300,
  velvet: 400,
  wax: 320,
  royale: 550,
};

export const CURRENCY = 'EGP';

function mergePrices(rows) {
  const prices = { ...DEFAULT_PRICES };
  for (const row of rows || []) {
    const value = Number(row.price);
    if (!Number.isFinite(value) || value < 0) continue;
    prices[row.template_id] = value;
  }
  return prices;
}

export function getDefaultTemplatePrices() {
  return { ...DEFAULT_PRICES };
}

export async function getTemplatePrices() {
  const { data, error } = await supabaseClient.rpc('get_template_prices');
  if (error) throw error;
  return mergePrices(data);
}

export async function getTemplatePrice(templateId) {
  const prices = await getTemplatePrices();
  return prices[templateId] ?? DEFAULT_PRICES[templateId] ?? 0;
}

export async function setTemplatePrice(templateId, price) {
  const value = Number(price);
  if (Number.isNaN(value) || value < 0) return { ok: false, error: 'invalid-price' };

  const { data, error } = await supabaseClient.rpc('upsert_template_price', {
    p_template_id: templateId,
    p_price: value,
  });
  if (error) return { ok: false, error: 'server' };

  return { ok: true };
}
