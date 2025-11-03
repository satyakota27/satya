class SubFunctionalitiesController < ApplicationController
  before_action :set_functionality, only: [:index, :new, :create]
  before_action :set_sub_functionality, only: [:show, :edit, :update, :destroy]
  before_action :ensure_super_admin

  def index
    authorize! :read, SubFunctionality
    @sub_functionalities = @functionality.sub_functionalities.ordered
  end

  def show
    authorize! :read, @sub_functionality
  end

  def new
    @sub_functionality = @functionality.sub_functionalities.build
    authorize! :create, SubFunctionality
  end

  def create
    @sub_functionality = @functionality.sub_functionalities.build(sub_functionality_params)
    authorize! :create, @sub_functionality

    if @sub_functionality.save
      redirect_to functionality_path(@functionality), notice: 'Sub-functionality was successfully created.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    authorize! :update, @sub_functionality
  end

  def update
    authorize! :update, @sub_functionality

    if @sub_functionality.update(sub_functionality_params)
      redirect_to functionality_path(@sub_functionality.functionality), notice: 'Sub-functionality was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :destroy, @sub_functionality
    
    functionality = @sub_functionality.functionality
    
    if @sub_functionality.user_permissions.any?
      redirect_to functionality_path(functionality), alert: 'Cannot delete sub-functionality that is assigned to users. Please remove assignments first.'
    else
      @sub_functionality.destroy
      redirect_to functionality_path(functionality), notice: 'Sub-functionality was successfully deleted.'
    end
  end

  private

  def set_functionality
    @functionality = Functionality.find(params[:functionality_id])
  end

  def set_sub_functionality
    @sub_functionality = SubFunctionality.find(params[:id])
    @functionality = @sub_functionality.functionality
  end

  def sub_functionality_params
    params.require(:sub_functionality).permit(:name, :code, :description, :screen, :active, :display_order)
  end

  def ensure_super_admin
    unless current_user.super_admin?
      redirect_to root_path, alert: 'Access denied. Only super admins can manage sub-functionalities.'
    end
  end
end
