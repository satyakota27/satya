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
      # Material approvers can read draft and approved materials, but NOT rejected ones
      if user.has_permission?('material_approver')
        # Grant general read permission for class-level checks (index action)
        if user.super_admin?
          can :read, Material
        else
          can :read, Material, tenant_id: user.tenant_id
        end
        # Explicitly deny rejected materials - cannot takes precedence over can
        if user.super_admin?
          cannot :read, Material do |material|
            material.rejected?
          end
        else
          cannot :read, Material do |material|
            material.tenant_id == user.tenant_id && material.rejected?
          end
        end
      end
      
      # Material creators can read their own materials (including rejected ones to see comments)
      # Only grant this if user doesn't have approver permission (to avoid conflicts)
      if user.has_permission?('create_material') && !user.has_permission?('material_approver')
        if user.super_admin?
          can :read, Material
        else
          can :read, Material, tenant_id: user.tenant_id
        end
      end
      
      # If user has both create_material and material_approver, they can read rejected materials
      # (as creators) but approvers won't see them in listings due to index filtering
      if user.has_permission?('create_material') && user.has_permission?('material_approver')
        if user.super_admin?
          can :read, Material do |material|
            material.rejected?
          end
        else
          can :read, Material do |material|
            material.tenant_id == user.tenant_id && material.rejected?
          end
        end
      end
      
      # Material listing permission (for viewing approved materials)
      if user.has_permission?('material_listing') || user.has_permission?('enable_disable_material')
        if user.super_admin?
          can :read, Material
        else
          can :read, Material, tenant_id: user.tenant_id
        end
      end
      
      # Super admins can read all materials
      can :read, Material if user.super_admin?

      # Material creation permission
      if user.has_permission?('create_material')
        can :create, Material
        # Can update materials in draft or rejected state (to allow amending rejected materials)
        if user.super_admin?
          can :update, Material do |material|
            material.draft? || material.rejected?
          end
        else
          can :update, Material do |material|
            material.tenant_id == user.tenant_id && (material.draft? || material.rejected?)
          end
        end
        can :destroy, Material, tenant_id: user.tenant_id unless user.super_admin?
        can :destroy, Material if user.super_admin?
      end

      # Material approver permission
      if user.has_permission?('material_approver')
        if user.super_admin?
          can :approve, Material do |material|
            material.draft?
          end
          can :reject, Material do |material|
            material.draft?
          end
        else
          can :approve, Material do |material|
            material.tenant_id == user.tenant_id && material.draft?
          end
          can :reject, Material do |material|
            material.tenant_id == user.tenant_id && material.draft?
          end
        end
      end

      # Unit of measurement permissions
      # Anyone with material_management can read units
      can :read, UnitOfMeasurement, tenant_id: user.tenant_id unless user.super_admin?
      can :read, UnitOfMeasurement if user.super_admin?
      
      # Users who can create materials should also be able to create units
      if user.has_permission?('create_material')
        can :create, UnitOfMeasurement
        can :update, UnitOfMeasurement, tenant_id: user.tenant_id unless user.super_admin?
        can :update, UnitOfMeasurement if user.super_admin?
        can :destroy, UnitOfMeasurement, tenant_id: user.tenant_id unless user.super_admin?
        can :destroy, UnitOfMeasurement if user.super_admin?
      end
      
      # Super admins can manage all units
      can :manage, UnitOfMeasurement if user.super_admin?
      
      # Quality Tests permissions
      can :read, QualityTest, tenant_id: user.tenant_id unless user.super_admin?
      can :read, QualityTest if user.super_admin?
      
      # Users who can create materials should also be able to create quality tests
      if user.has_permission?('create_material')
        can :create, QualityTest
        can :update, QualityTest, tenant_id: user.tenant_id unless user.super_admin?
        can :update, QualityTest if user.super_admin?
        can :destroy, QualityTest, tenant_id: user.tenant_id unless user.super_admin?
        can :destroy, QualityTest if user.super_admin?
      end
      
      # Super admins can manage all quality tests
      can :manage, QualityTest if user.super_admin?
    end
  end
end
