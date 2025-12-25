import { UserRole } from '@prisma/client';

export interface Permission {
  resource: string;
  action: string;
  conditions?: string[];
}

export const PERMISSIONS = {
  // User permissions
  USER_CREATE: { resource: 'user', action: 'create' },
  USER_READ: { resource: 'user', action: 'read' },
  USER_UPDATE: { resource: 'user', action: 'update' },
  USER_DELETE: { resource: 'user', action: 'delete' },
  USER_READ_ALL: { resource: 'user', action: 'read', conditions: ['all'] },
  USER_UPDATE_ROLE: { resource: 'user', action: 'update', conditions: ['role'] },

  // Branch permissions
  BRANCH_CREATE: { resource: 'branch', action: 'create' },
  BRANCH_READ: { resource: 'branch', action: 'read' },
  BRANCH_UPDATE: { resource: 'branch', action: 'update' },
  BRANCH_DELETE: { resource: 'branch', action: 'delete' },
  BRANCH_READ_ALL: { resource: 'branch', action: 'read', conditions: ['all'] },

  // Invoice permissions
  INVOICE_CREATE: { resource: 'invoice', action: 'create' },
  INVOICE_READ: { resource: 'invoice', action: 'read' },
  INVOICE_UPDATE: { resource: 'invoice', action: 'update' },
  INVOICE_DELETE: { resource: 'invoice', action: 'delete' },
  INVOICE_READ_ALL: { resource: 'invoice', action: 'read', conditions: ['all'] },
  INVOICE_PAY: { resource: 'invoice', action: 'update', conditions: ['pay'] },

  // Dashboard permissions
  DASHBOARD_READ: { resource: 'dashboard', action: 'read' },
  DASHBOARD_STATS: { resource: 'dashboard', action: 'read', conditions: ['stats'] },

  // Hospital permissions
  HOSPITAL_CREATE: { resource: 'hospital', action: 'create' },
  HOSPITAL_READ: { resource: 'hospital', action: 'read' },
  HOSPITAL_UPDATE: { resource: 'hospital', action: 'update' },
  HOSPITAL_DELETE: { resource: 'hospital', action: 'delete' },

  // Doctor permissions  
  DOCTOR_CREATE: { resource: 'doctor', action: 'create' },
  DOCTOR_READ: { resource: 'doctor', action: 'read' },
  DOCTOR_UPDATE: { resource: 'doctor', action: 'update' },
  DOCTOR_DELETE: { resource: 'doctor', action: 'delete' },

  // Audit permissions
  AUDIT_READ: { resource: 'audit', action: 'read' },
  AUDIT_READ_ALL: { resource: 'audit', action: 'read', conditions: ['all'] },

  // Notification permissions
  NOTIFICATION_CREATE: { resource: 'notification', action: 'create' },
  NOTIFICATION_READ: { resource: 'notification', action: 'read' },
  NOTIFICATION_UPDATE: { resource: 'notification', action: 'update' },
  NOTIFICATION_DELETE: { resource: 'notification', action: 'delete' },
} as const;

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admin has all permissions
    ...(Object.values(PERMISSIONS) as Permission[]),
  ],
  
  [UserRole.SUPERVISOR]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.BRANCH_READ,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.NOTIFICATION_READ,
    PERMISSIONS.HOSPITAL_READ,
    PERMISSIONS.HOSPITAL_UPDATE,
    PERMISSIONS.DOCTOR_READ,
  ],
  
  [UserRole.AGENT]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.BRANCH_READ,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.NOTIFICATION_READ,
    PERMISSIONS.HOSPITAL_READ,
    PERMISSIONS.DOCTOR_READ,
  ],
  
  [UserRole.CORPORATE]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.BRANCH_READ,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.NOTIFICATION_READ,
    PERMISSIONS.HOSPITAL_READ,
    PERMISSIONS.DOCTOR_READ,
  ],
  
  // Add missing roles with basic permissions
  [UserRole.DOCTOR]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.BRANCH_READ,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.NOTIFICATION_READ,
    PERMISSIONS.HOSPITAL_READ,
    PERMISSIONS.DOCTOR_READ,
  ],
  
  [UserRole.HOSPITAL]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.BRANCH_READ,
    PERMISSIONS.BRANCH_UPDATE,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_UPDATE,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.NOTIFICATION_READ,
    PERMISSIONS.NOTIFICATION_CREATE,
    PERMISSIONS.HOSPITAL_READ,
    PERMISSIONS.HOSPITAL_UPDATE,
    PERMISSIONS.DOCTOR_READ,
  ],
  
  [UserRole.PATIENT]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.BRANCH_READ,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.NOTIFICATION_READ,
    PERMISSIONS.HOSPITAL_READ,
    PERMISSIONS.DOCTOR_READ,
  ],
};

export class PermissionChecker {
  static hasPermission(
    userRole: UserRole,
    requiredPermission: Permission
  ): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    
    return rolePermissions.some(permission => 
      this.permissionMatches(permission, requiredPermission)
    );
  }

  static hasAnyPermission(
    userRole: UserRole,
    requiredPermissions: Permission[]
  ): boolean {
    return requiredPermissions.some(permission =>
      this.hasPermission(userRole, permission)
    );
  }

  static hasAllPermissions(
    userRole: UserRole,
    requiredPermissions: Permission[]
  ): boolean {
    return requiredPermissions.every(permission =>
      this.hasPermission(userRole, permission)
    );
  }

  private static permissionMatches(
    userPermission: Permission,
    requiredPermission: Permission
  ): boolean {
    // Check resource and action
    if (userPermission.resource !== requiredPermission.resource ||
        userPermission.action !== requiredPermission.action) {
      return false;
    }

    // Check conditions if required
    if (requiredPermission.conditions) {
      if (!userPermission.conditions) {
        return false;
      }
      
      return requiredPermission.conditions.every(condition =>
        userPermission.conditions!.includes(condition)
      );
    }

    return true;
  }

  static canAccessResource(
    userRole: UserRole,
    resource: string,
    action: string,
    conditions?: string[]
  ): boolean {
    const permission: Permission = {
      resource,
      action,
      conditions,
    };

    return this.hasPermission(userRole, permission);
  }

  static getAccessibleResources(userRole: UserRole): string[] {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    const resources = new Set<string>();
    
    rolePermissions.forEach(permission => {
      resources.add(permission.resource);
    });
    
    return Array.from(resources);
  }

  static getAccessibleActions(userRole: UserRole, resource: string): string[] {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    const actions = new Set<string>();
    
    rolePermissions.forEach(permission => {
      if (permission.resource === resource) {
        actions.add(permission.action);
      }
    });
    
    return Array.from(actions);
  }
}

export default PermissionChecker;
