class DashboardController < ApplicationController
  skip_authorization_check

  def index
    if current_user.super_admin?
      # Super admins see all tenants and users (no tenant scoping)
      ActsAsTenant.with_tenant(nil) do
        @tenants_count = Tenant.count
        @users_count = User.count
        @recent_tenants = Tenant.order(created_at: :desc).limit(5)
      end
    elsif current_user.tenant_admin?
      # Tenant admins see their tenant's data (automatically scoped by acts_as_tenant)
      @tenant = current_user.tenant
      @users = User.all # This will be tenant-scoped automatically
      @users_count = @users.count
    else
      # Regular users only see their own data
      @tenant = current_user.tenant
    end
  end
end
