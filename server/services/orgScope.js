// Tenant-scoping rules for delegated administration. Every team/training action
// must pass one of these BEFORE touching a target user, so a partner admin can
// never reach another tenant, and a team manager stays inside their function.

export const TENANT_MANAGER_ROLES = ['org_admin', 'team_manager'];

// Can `actor` see/act on `target` for training purposes?
//  - org_admin:    any member of their own org
//  - team_manager: members of their own org sharing their role_category (function)
//  - others:       no one
export function canManageMember(actor, target) {
  if (!actor || !target) return false;
  if (actor.org_id == null || actor.org_id !== target.org_id) return false;
  if (actor.role === 'org_admin') return true;
  if (actor.role === 'team_manager') return !!actor.role_category && actor.role_category === target.role_category;
  return false;
}

// SQL fragment + params to list the members in an actor's scope (excluding
// nobody by default; caller adds ordering). Returns { where, params }.
export function memberScopeClause(actor) {
  if (actor.role === 'org_admin') {
    return { where: 'org_id = ?', params: [actor.org_id] };
  }
  if (actor.role === 'team_manager') {
    return { where: 'org_id = ? AND role_category = ?', params: [actor.org_id, actor.role_category] };
  }
  // No scope - return a clause that matches nothing.
  return { where: '1 = 0', params: [] };
}

// Is this a role a partner admin is allowed to assign within their tenant?
// Deliberately excludes super_admin - vendor-side power never leaks to tenants.
export const ASSIGNABLE_TENANT_ROLES = ['org_admin', 'team_manager', 'user'];
