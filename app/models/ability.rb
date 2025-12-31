# frozen_string_literal: true

class Ability
  include CanCan::Ability

  def initialize(user)
    return unless user.present?

    if user.super_admin?
      can :manage, :all
      # Super admins can manage functionalities and sub-functionalities
      can :manage, Functionality
      can :manage, SubFunctionality
    elsif user.tenant_admin?
      can :manage, User, tenant_id: user.tenant_id
      can :read, Tenant, id: user.tenant_id
      # Tenant admins can assign functionalities to users in their tenant
      can :manage, UserPermission, user: { tenant_id: user.tenant_id }
      # Tenant admins can view functionalities only in the context of user creation (not via functionalities index)
      # They don't have direct access to functionalities pages
    else
      can :read, User, tenant_id: user.tenant_id, id: user.id
      can :read, Tenant, id: user.tenant_id
      # Regular users don't have direct access to functionalities pages
    end

    # Material Management permissions
    if user.has_functionality?('material_management')
      # Can read materials if has any material_management sub-functionality
      can :read, Material, tenant_id: user.tenant_id unless user.super_admin?
      can :read, Material if user.super_admin?

      # Material creation permission
      if user.has_permission?('material_creation') || user.has_permission?('create_material')
        can :create, Material
        can :update, Material, tenant_id: user.tenant_id unless user.super_admin?
        can :update, Material if user.super_admin?
        can :destroy, Material, tenant_id: user.tenant_id unless user.super_admin?
        can :destroy, Material if user.super_admin?
      end

      # Material approver permission
      if user.has_permission?('material_approver')
        can :approve, Material, tenant_id: user.tenant_id unless user.super_admin?
        can :approve, Material if user.super_admin?
      end

      # Material listing permission (for viewing)
      if user.has_permission?('material_listing') || user.has_permission?('enable_disable_material')
        can :read, Material, tenant_id: user.tenant_id unless user.super_admin?
        can :read, Material if user.super_admin?
      end

      # Unit of measurement permissions
      # Anyone with material_management can read units
      can :read, UnitOfMeasurement, tenant_id: user.tenant_id unless user.super_admin?
      can :read, UnitOfMeasurement if user.super_admin?
      
      # Users who can create materials should also be able to create units
      if user.has_permission?('material_creation') || user.has_permission?('create_material')
        can :create, UnitOfMeasurement
        can :update, UnitOfMeasurement, tenant_id: user.tenant_id unless user.super_admin?
        can :update, UnitOfMeasurement if user.super_admin?
        can :destroy, UnitOfMeasurement, tenant_id: user.tenant_id unless user.super_admin?
        can :destroy, UnitOfMeasurement if user.super_admin?
      end
      
      # Super admins can manage all units
      can :manage, UnitOfMeasurement if user.super_admin?
    end
  end
end
