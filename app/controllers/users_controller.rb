class UsersController < ApplicationController
  before_action :set_user, only: [:show, :edit, :update, :destroy]

  def index
    # acts_as_tenant automatically scopes queries based on ActsAsTenant.current_tenant
    # Super admins see all users (no tenant scoping)
    # Others see only users in their tenant
    if current_user.super_admin?
      ActsAsTenant.with_tenant(nil) do
        @users = User.all
      end
    else
      # For tenant admins and regular users, acts_as_tenant will automatically scope
      @users = current_user.tenant_admin? ? User.all : [current_user]
    end
    authorize! :read, User
  end

  def show
    authorize! :read, @user
    # Load user's permissions for display
    @user_permissions = @user.user_permissions.includes(sub_functionality: :functionality)
  end

  def new
    @user = User.new
    @tenants = current_user.super_admin? ? Tenant.all : [current_user.tenant]
    # Load functionalities only for tenant admins (they assign permissions)
    if current_user.tenant_admin?
      @functionalities = Functionality.active.ordered.includes(:sub_functionalities)
    end
    authorize! :create, User
  end

  def create
    @user = User.new(user_params)
    authorize! :create, @user

    # Set tenant based on role and current user context
    if current_user.super_admin?
      if @user.role == 'super_admin'
        @user.tenant_id = nil # Super admins don't have tenants
      else
        @user.tenant_id = user_params[:tenant_id] if user_params[:tenant_id].present?
      end
      # Super admin can set any role
    elsif current_user.tenant_admin?
      @user.tenant_id = current_user.tenant_id
      @user.role = 'user' # Tenant admins can only create regular users
    end

    if @user.save
      # Assign functionalities only if tenant admin is creating the user
      if current_user.tenant_admin? && user_params[:sub_functionality_ids].present?
        sub_functionality_ids = user_params[:sub_functionality_ids].reject(&:blank?).map(&:to_i)
        @user.sub_functionality_ids = sub_functionality_ids
      end
      
      redirect_to @user, notice: 'User was successfully created.'
    else
      @tenants = current_user.super_admin? ? Tenant.all : [current_user.tenant]
      if current_user.tenant_admin?
        @functionalities = Functionality.active.ordered.includes(:sub_functionalities)
      end
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    authorize! :update, @user
    @tenants = current_user.super_admin? ? Tenant.all : [current_user.tenant]
    # Load functionalities only for tenant admins (they assign permissions)
    if current_user.tenant_admin?
      @functionalities = Functionality.active.ordered.includes(:sub_functionalities)
      # Validate user belongs to tenant admin's tenant
      unless @user.tenant_id == current_user.tenant_id
        raise ActiveRecord::RecordNotFound
      end
    end
  end

  def update
    authorize! :update, @user

    user_update_params = user_params.dup

    # Remove password fields if blank
    if user_update_params[:password].blank?
      user_update_params.delete(:password)
      user_update_params.delete(:password_confirmation)
    end

    # Tenant admins can't change tenant or role
    unless current_user.super_admin?
      user_update_params.delete(:tenant_id)
      user_update_params.delete(:role)
    else
      # Super admins: if role is super_admin, tenant must be nil
      if user_update_params[:role] == 'super_admin'
        user_update_params[:tenant_id] = nil
      end
    end

    if @user.update(user_update_params)
      # Update functionalities only if tenant admin is updating the user
      if current_user.tenant_admin?
        # Validate user belongs to tenant admin's tenant
        unless @user.tenant_id == current_user.tenant_id
          raise ActiveRecord::RecordNotFound
        end
        # Update sub-functionality assignments (even if empty array, to clear permissions)
        sub_functionality_ids = (user_params[:sub_functionality_ids] || []).reject(&:blank?).map(&:to_i)
        @user.sub_functionality_ids = sub_functionality_ids
      end
      
      redirect_to @user, notice: 'User was successfully updated.'
    else
      @tenants = current_user.super_admin? ? Tenant.all : [current_user.tenant]
      if current_user.tenant_admin?
        @functionalities = Functionality.active.ordered.includes(:sub_functionalities)
      end
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :destroy, @user
    @user.destroy
    redirect_to users_path, notice: 'User was successfully deleted.'
  end

  private

  def set_user
    # Super admins can access any user, others are limited to their tenant
    if current_user.super_admin?
      ActsAsTenant.with_tenant(nil) do
        @user = User.find(params[:id])
      end
    else
      @user = User.find(params[:id])
      # Additional check - ensure user belongs to current user's tenant
      unless @user.tenant_id == current_user.tenant_id || current_user.super_admin?
        raise ActiveRecord::RecordNotFound
      end
    end
  end

  def user_params
    permitted_params = [:email, :password, :password_confirmation, :role, :tenant_id]
    # Only tenant admins can assign functionalities
    if current_user.tenant_admin?
      permitted_params << { sub_functionality_ids: [] }
    end
    params.require(:user).permit(permitted_params)
  end
end
