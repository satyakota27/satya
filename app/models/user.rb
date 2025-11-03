class User < ApplicationRecord
  include TenantIsolated

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable,
         :recoverable, :rememberable, :validatable

  # Tenant scoping: super admins are not tenant-scoped (optional: true)
  # All other users must belong to a tenant
  acts_as_tenant :tenant, optional: true

  belongs_to :tenant, optional: true

  # Scope for queries - super admins bypass tenant scoping
  scope :without_tenant_scope, -> { unscoped }
  
  # Default scope is handled by acts_as_tenant based on ActsAsTenant.current_tenant

  enum :role, { super_admin: 'super_admin', tenant_admin: 'tenant_admin', user: 'user' }

  validates :role, presence: true
  validates :email, uniqueness: true
  validate :tenant_required_for_non_super_admin

  # Rails enum automatically creates super_admin? and tenant_admin? methods

  # Ensure tenant is always set correctly before save
  before_save :ensure_tenant_setting

  private

  def tenant_required_for_non_super_admin
    return if super_admin? || tenant_id.present?

    errors.add(:tenant_id, 'is required for non-super-admin users')
  end

  def ensure_tenant_setting
    # Enforce that super admins don't have tenants
    if super_admin?
      self.tenant_id = nil
    end
    # Tenant admins and regular users must have a tenant
    # (validation will catch this)
  end
end
