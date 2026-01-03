class InventoryItemsController < ApplicationController
  include TenantScoped

  before_action :set_inventory_item, only: [:show, :edit, :update, :destroy]
  before_action :set_material, only: [:index, :new, :create]

  def index
    authorize! :read, InventoryItem
    @inventory_items = InventoryItem.all
    
    @inventory_items = @inventory_items.by_material(@material) if @material.present?
    @inventory_items = @inventory_items.by_warehouse_location(WarehouseLocation.find(params[:location_id])) if params[:location_id].present?
    @inventory_items = @inventory_items.where("serial_number ILIKE ? OR batch_number ILIKE ? OR legacy_serial_id ILIKE ? OR legacy_batch_number ILIKE ?", 
                                                 "%#{params[:search]}%", "%#{params[:search]}%", "%#{params[:search]}%", "%#{params[:search]}%") if params[:search].present?
    
    @inventory_items = @inventory_items.includes(:material, :warehouse_location, :created_by)
                                        .order(created_at: :desc)
                                        .page(params[:page]).per(20)
  end

  def show
    authorize! :read, @inventory_item
  end

  def new
    authorize! :create, InventoryItem
    @inventory_item = InventoryItem.new
    @inventory_item.material = @material if @material.present?
    @materials = Material.approved.order(:material_code) if @material.blank?
    @warehouse_locations = WarehouseLocation.active.order(:name)
  end

  def create
    authorize! :create, InventoryItem
    @inventory_item = InventoryItem.new(inventory_item_params)
    @inventory_item.tenant = current_user.tenant unless current_user.super_admin?
    @inventory_item.created_by = current_user

    if @inventory_item.save
      if @material.present?
        redirect_to material_inventory_items_path(@material), notice: 'Inventory item was successfully created.'
      else
        redirect_to @inventory_item, notice: 'Inventory item was successfully created.'
      end
    else
      @materials = Material.approved.order(:material_code) if @material.blank?
      @warehouse_locations = WarehouseLocation.active.order(:name)
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    authorize! :update, @inventory_item
    @materials = Material.approved.order(:material_code)
    @warehouse_locations = WarehouseLocation.active.order(:name)
    @material = @inventory_item.material
  end

  def update
    authorize! :update, @inventory_item
    if @inventory_item.update(inventory_item_params)
      redirect_to @inventory_item, notice: 'Inventory item was successfully updated.'
    else
      @materials = Material.approved.order(:material_code)
      @warehouse_locations = WarehouseLocation.active.order(:name)
      @material = @inventory_item.material
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :destroy, @inventory_item
    @inventory_item.destroy
    redirect_to inventory_items_path, notice: 'Inventory item was successfully deleted.'
  end

  def upload_csv
    authorize! :create, InventoryItem
    unless params[:csv_file].present?
      redirect_to inventory_items_path, alert: 'Please select a CSV file to upload.'
      return
    end

    result = InventoryCsvImporter.new(params[:csv_file], current_user).import
    
    if result[:success_count] > 0
      notice = "Successfully imported #{result[:success_count]} inventory item(s)."
      notice += " #{result[:failure_count]} failed." if result[:failure_count] > 0
      redirect_to inventory_items_path, notice: notice
    else
      alert = "Failed to import inventory items. #{result[:errors].join(', ')}"
      redirect_to inventory_items_path, alert: alert
    end
  end

  def download_csv_template
    authorize! :create, InventoryItem
    csv_content = InventoryCsvImporter.generate_template
    send_data csv_content, filename: "inventory_import_template_#{Date.today}.csv", type: 'text/csv'
  end

  private

  def set_inventory_item
    @inventory_item = InventoryItem.find(params[:id])
  end

  def set_material
    @material = Material.find(params[:material_id]) if params[:material_id].present?
  end

  def inventory_item_params
    params.require(:inventory_item).permit(:material_id, :warehouse_location_id, 
                                           :quantity, :legacy_serial_id, :legacy_batch_number, :notes, 
                                           :purchase_date, :expiry_date, :cost, :supplier)
    # serial_number and batch_number are auto-generated and not permitted
  end
end

