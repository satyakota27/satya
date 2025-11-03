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
  end
end
