class FunctionalitiesController < ApplicationController
  before_action :set_functionality, only: [:show, :edit, :update, :destroy]
  before_action :ensure_super_admin

  def index
    authorize! :read, Functionality
    @functionalities = Functionality.ordered.includes(:sub_functionalities)
  end

  def show
    authorize! :read, @functionality
    @sub_functionalities = @functionality.sub_functionalities.ordered
  end

  def new
    @functionality = Functionality.new
    authorize! :create, Functionality
  end

  def create
    @functionality = Functionality.new(functionality_params)
    authorize! :create, @functionality

    if @functionality.save
      redirect_to @functionality, notice: 'Functionality was successfully created.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    authorize! :update, @functionality
  end

  def update
    authorize! :update, @functionality

    if @functionality.update(functionality_params)
      redirect_to @functionality, notice: 'Functionality was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :destroy, @functionality
    
    if @functionality.sub_functionalities.any?
      redirect_to functionalities_path, alert: 'Cannot delete functionality with existing sub-functionalities. Please delete sub-functionalities first.'
    else
      @functionality.destroy
      redirect_to functionalities_path, notice: 'Functionality was successfully deleted.'
    end
  end

  private

  def set_functionality
    @functionality = Functionality.find(params[:id])
  end

  def functionality_params
    params.require(:functionality).permit(:name, :code, :description, :active, :display_order)
  end

  def ensure_super_admin
    unless current_user.super_admin?
      redirect_to root_path, alert: 'Access denied. Only super admins can manage functionalities.'
    end
  end
end
