class WarehouseLocationsController < ApplicationController
  include TenantScoped

  before_action :set_warehouse_location, only: [:show, :edit, :update, :destroy, :children]

  def index
    authorize! :read, WarehouseLocation
    @warehouse_locations = WarehouseLocation.roots.active.includes(:warehouse_location_type, :children)
  end

  def show
    authorize! :read, @warehouse_location
    @inventory_items = @warehouse_location.inventory_items.includes(:material).limit(50)
    @inventory_count = @warehouse_location.inventory_items.sum(:quantity)
  end

  def new
    authorize! :create, WarehouseLocation
    @warehouse_location = WarehouseLocation.new
    @warehouse_location.parent_id = params[:parent_id] if params[:parent_id].present?
    @warehouse_location_types = WarehouseLocationType.active.ordered
    @parent_locations = WarehouseLocation.active.where.not(id: params[:parent_id]).order(:name)
    
    respond_to do |format|
      format.html
      format.json { render json: { form: render_to_string(partial: 'form', locals: { warehouse_location: @warehouse_location }) } }
    end
  end

  def create
    authorize! :create, WarehouseLocation
    @warehouse_location = WarehouseLocation.new(warehouse_location_params)
    @warehouse_location.tenant = current_user.tenant unless current_user.super_admin?

    respond_to do |format|
      if @warehouse_location.save
        format.html { redirect_to @warehouse_location, notice: 'Warehouse location was successfully created.' }
        format.json { render json: { success: true, location: location_to_json(@warehouse_location), message: 'Warehouse location was successfully created.' } }
      else
        @warehouse_location_types = WarehouseLocationType.active.ordered
        @parent_locations = WarehouseLocation.active.order(:name)
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: { success: false, errors: @warehouse_location.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  def edit
    authorize! :update, @warehouse_location
    @warehouse_location_types = WarehouseLocationType.active.ordered
    @parent_locations = WarehouseLocation.active.where.not(id: @warehouse_location.id).order(:name)
  end

  def update
    authorize! :update, @warehouse_location
    if @warehouse_location.update(warehouse_location_params)
      redirect_to @warehouse_location, notice: 'Warehouse location was successfully updated.'
    else
      @warehouse_location_types = WarehouseLocationType.active.ordered
      @parent_locations = WarehouseLocation.active.where.not(id: @warehouse_location.id).order(:name)
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :destroy, @warehouse_location
    if @warehouse_location.children.any?
      redirect_to warehouse_locations_path, alert: 'Cannot delete location that has children.'
    elsif @warehouse_location.inventory_items.any?
      redirect_to warehouse_locations_path, alert: 'Cannot delete location that has inventory items.'
    else
      @warehouse_location.destroy
      redirect_to warehouse_locations_path, notice: 'Warehouse location was successfully deleted.'
    end
  end

  def tree
    authorize! :read, WarehouseLocation
    roots = WarehouseLocation.roots.active.includes(:warehouse_location_type, :children)
    render json: roots.map { |loc| location_to_json(loc) }
  end

  def children
    authorize! :read, WarehouseLocation
    children = @warehouse_location.children.active.includes(:warehouse_location_type, :children)
    render json: children.map { |loc| location_to_json(loc) }
  end

  def search
    authorize! :read, WarehouseLocation
    query = params[:q] || ''
    locations = WarehouseLocation.active.searchable(query).limit(20)
    render json: locations.map { |loc| { id: loc.id, code: loc.location_code, name: loc.name, path: loc.full_path } }
  end

  private

  def set_warehouse_location
    @warehouse_location = WarehouseLocation.find(params[:id])
  end

  def warehouse_location_params
    params.require(:warehouse_location).permit(:warehouse_location_type_id, :parent_id, :location_code, :name, :description, :active)
  end

  def location_to_json(location)
    {
      id: location.id,
      code: location.location_code,
      name: location.name,
      type: location.warehouse_location_type.name,
      path: location.full_path,
      has_children: location.children.any?,
      children_count: location.children.count,
      inventory_count: location.inventory_items.sum(:quantity)
    }
  end
end

