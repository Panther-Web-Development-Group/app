/**
 * Supabase Server Functions
 * 
 * This directory contains all server-side Supabase database functions.
 * These functions are organized by domain (pages, posts, navigation, etc.)
 */

// Pages
export { getPageBySlug, getPages } from "./pages"

// Posts
export { getPostBySlug, getPosts } from "./posts"

// Navigation
export { getNavigationItems, getNavigationTree } from "./navigation"

// Sections
export { getPageSectionsByPageId } from "./sections"

// Auth
export { getCurrentUser, requireAuth } from "./auth"
