# frozen_string_literal: true

class Ability
  include CanCan::Ability

  def initialize(user)
    return unless user.present?

    if user.super_admin?
      can :manage, :all
    elsif user.tenant_admin?
      can :manage, User, tenant_id: user.tenant_id
      can :read, Tenant, id: user.tenant_id
    else
      can :read, User, tenant_id: user.tenant_id, id: user.id
      can :read, Tenant, id: user.tenant_id
    end
  end
end
