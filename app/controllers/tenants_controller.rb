class TenantsController < ApplicationController
  before_action :set_tenant, only: [:show, :edit, :update, :destroy]

  def index
    # Only super admins can see all tenants
    # Tenant admins and regular users only see their own tenant
    if current_user.super_admin?
      @tenants = Tenant.all
    else
      @tenants = [current_user.tenant].compact
    end
    authorize! :read, Tenant
  end

  def show
    authorize! :read, @tenant
    @users = @tenant.users
    @subscription = @tenant.current_subscription
  end

  def new
    @tenant = Tenant.new
    authorize! :create, Tenant
  end

  def create
    @tenant = Tenant.new(tenant_params)
    authorize! :create, @tenant

    if @tenant.save
      redirect_to @tenant, notice: 'Tenant was successfully created.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    authorize! :update, @tenant
  end

  def update
    authorize! :update, @tenant

    if @tenant.update(tenant_params)
      redirect_to @tenant, notice: 'Tenant was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :destroy, @tenant
    @tenant.destroy
    redirect_to tenants_path, notice: 'Tenant was successfully deleted.'
  end

  private

  def set_tenant
    # Super admins can access any tenant
    # Others can only access their own tenant
    @tenant = Tenant.find(params[:id])
    
    unless current_user.super_admin?
      unless @tenant.id == current_user.tenant_id
        raise ActiveRecord::RecordNotFound
      end
    end
  end

  def tenant_params
    params.require(:tenant).permit(:name, :subdomain)
  end
end
