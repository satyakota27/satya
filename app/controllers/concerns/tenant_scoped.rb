module TenantScoped
  extend ActiveSupport::Concern

  included do
    before_action :set_current_tenant_context, if: :user_signed_in?
    before_action :enforce_tenant_isolation, if: :user_signed_in?, unless: -> { current_user&.super_admin? }
  end

  private

  def set_current_tenant_context
    # Set tenant context for acts_as_tenant
    # Super admins have no tenant, so set to nil
    if current_user&.super_admin?
      ActsAsTenant.current_tenant = nil
    else
      ActsAsTenant.current_tenant = current_user&.tenant
    end
  end

  def enforce_tenant_isolation
    # Additional check to ensure tenant isolation
    # This is a safety net - acts_as_tenant should handle most of this
    return if current_user.nil?
    return if current_user.super_admin?

    # Ensure users can only access their tenant's data
    unless current_user.tenant_id.present?
      redirect_to root_path, alert: "You must be assigned to a tenant to access this resource."
    end
  end
end

