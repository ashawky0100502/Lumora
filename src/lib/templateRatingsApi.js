/**
 * TEMPLATE RATINGS API
 * Wraps supabase/template_ratings.sql. One star rating per visitor per
 * template (visitorIdentity.js's token), aggregated into an average +
 * count that VisitorTemplateGallery.jsx shows on each card.
 */
import { supabaseClient } from './supabaseClient';

// { [templateId]: { avgRating, ratingCount } } for every template that has
// at least one rating. Templates with none simply don't show up here —
// the gallery renders those as "New" rather than a fabricated number.
export async function getTemplateRatingsSummary() {
  const { data, error } = await supabaseClient.rpc('get_template_ratings_summary');
  if (error) throw error;
  const map = {};
  for (const row of data || []) {
    map[row.template_id] = { avgRating: Number(row.avg_rating), ratingCount: row.rating_count };
  }
  return map;
}

// { [templateId]: rating } — this visitor's own stars, so the gallery can
// show them highlighted instead of empty on return visits.
export async function getVisitorOwnRatings(visitorToken) {
  const { data, error } = await supabaseClient.rpc('visitor_get_own_ratings', { p_visitor_token: visitorToken });
  if (error) throw error;
  const map = {};
  for (const row of data || []) {
    map[row.template_id] = row.rating;
  }
  return map;
}

// Submits (or updates) this visitor's rating for one template and returns
// the freshly recomputed { avgRating, ratingCount } for it.
export async function rateTemplate(visitorToken, templateId, rating) {
  const { data, error } = await supabaseClient.rpc('visitor_rate_template', {
    p_visitor_token: visitorToken,
    p_template_id: templateId,
    p_rating: rating,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row ? { avgRating: Number(row.avg_rating), ratingCount: row.rating_count } : { avgRating: rating, ratingCount: 1 };
}
