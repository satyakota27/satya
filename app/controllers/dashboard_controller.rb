class DashboardController < ApplicationController
  skip_authorization_check

  def index
    if current_user.super_admin?
      @tenants_count = Tenant.count
      @users_count = User.count
      @recent_tenants = Tenant.order(created_at: :desc).limit(5)
    elsif current_user.tenant_admin?
      @tenant = current_user.tenant
      @users = current_user.tenant.users
      @users_count = @users.count
    else
      @tenant = current_user.tenant
    end
  end
end
