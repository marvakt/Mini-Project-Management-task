// Frontend types as JSDoc
// Note: These are now in JavaScript - use JSDoc comments for reference

/**
 * @typedef {'admin' | 'developer'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {UserRole} role
 * @property {string} created_at
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} created_by
 * @property {string[]} [member_ids]
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {'todo' | 'in_progress' | 'done'} status
 * @property {string} project_id
 * @property {string} [assigned_to]
 * @property {string} [due_date]
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} TokenResponse
 * @property {string} access_token
 * @property {string} token_type
 */

/**
 * @typedef {Object} PaginatedResponse
 * @template T
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 * @property {T[]} items
 */

export {};
