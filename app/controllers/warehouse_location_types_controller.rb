class WarehouseLocationTypesController < ApplicationController
  include TenantScoped

  before_action :set_warehouse_location_type, only: [:show, :edit, :update, :destroy]

  def index
    authorize! :read, WarehouseLocationType
    @warehouse_location_types = WarehouseLocationType.active.ordered
  end

  def show
    authorize! :read, @warehouse_location_type
    @warehouse_locations = @warehouse_location_type.warehouse_locations.active
  end

  def new
    authorize! :create, WarehouseLocationType
    @warehouse_location_type = WarehouseLocationType.new
  end

  def create
    authorize! :create, WarehouseLocationType
    @warehouse_location_type = WarehouseLocationType.new(warehouse_location_type_params)
    @warehouse_location_type.tenant = current_user.tenant unless current_user.super_admin?

    if @warehouse_location_type.save
      redirect_to @warehouse_location_type, notice: 'Warehouse location type was successfully created.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    authorize! :update, @warehouse_location_type
  end

  def update
    authorize! :update, @warehouse_location_type
    if @warehouse_location_type.update(warehouse_location_type_params)
      redirect_to @warehouse_location_type, notice: 'Warehouse location type was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :destroy, @warehouse_location_type
    if @warehouse_location_type.warehouse_locations.any?
      redirect_to warehouse_location_types_path, alert: 'Cannot delete location type that has locations.'
    else
      @warehouse_location_type.destroy
      redirect_to warehouse_location_types_path, notice: 'Warehouse location type was successfully deleted.'
    end
  end

  private

  def set_warehouse_location_type
    @warehouse_location_type = WarehouseLocationType.find(params[:id])
  end

  def warehouse_location_type_params
    params.require(:warehouse_location_type).permit(:name, :code, :display_order, :active)
  end
end

