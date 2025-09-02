import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/utils/CreatePageUtil.js

/**
 * Generates the full route for a page.
 * Converts camelCase / PascalCase to kebab-case for URLs.
 * @param {string} pageName - Name of the page component.
 * @param {Object} [params] - Optional query parameters as an object.
 * @returns {string} - The route path.
 */
export function createPageUrl(pageName, params = {}) {
  // Convert PascalCase / camelCase to kebab-case
  const kebabCaseName = pageName
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();

  let url = `/pages/${kebabCaseName}`;

  // Append query params if provided
  const queryString = new URLSearchParams(params).toString();
  if (queryString) url += `?${queryString}`;

  return url;
}
