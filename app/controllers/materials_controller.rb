class MaterialsController < ApplicationController
  include TenantScoped

  before_action :set_material, only: [:show, :edit, :update, :destroy, :approve]

  def index
    authorize! :read, Material
    @materials = Material.all
    @materials = @materials.by_state(params[:state]) if params[:state].present?
    @materials = @materials.searchable(params[:search]) if params[:search].present?
    @materials = @materials.order(created_at: :desc)
    @materials = @materials.page(params[:page]).per(20)
    
    respond_to do |format|
      format.html
      format.json do
        materials_html = render_to_string(partial: 'materials_list', locals: { materials: @materials }, formats: [:html])
        pagination_html = render_to_string(partial: 'pagination', locals: { materials: @materials }, formats: [:html])
        render json: { materials: materials_html, pagination: pagination_html }
      end
    end
  end

  def search
    authorize! :read, Material
    query = params[:q] || ''
    @materials = Material.searchable(query).limit(10)
    
    render json: {
      materials: @materials.map { |m| 
        { 
          id: m.id, 
          material_code: m.material_code || 'Draft', 
          description: m.description 
        } 
      }
    }
  end

  def show
    authorize! :read, @material
    @bom_components = @material.material_bom_components.includes(:component_material) if @material.has_bom
  end

  def new
    authorize! :create, Material
    @material = Material.new
    @material.state = 'draft'
    @unit_of_measurements = UnitOfMeasurement.active.ordered
  end

  def create
    authorize! :create, Material
    @material = Material.new(material_params)
    @material.tenant = current_user.tenant unless current_user.super_admin?
    @material.state = 'draft'

    if @material.save
      # Handle BOM components if has_bom is true
      if @material.has_bom && params[:material][:bom_component_material_ids].present?
        material_ids = params[:material][:bom_component_material_ids].reject(&:blank?)
        quantities = params[:material][:bom_component_quantities].reject(&:blank?)
        
        material_ids.each_with_index do |material_id, index|
          if quantities[index].present?
            @material.material_bom_components.create(
              component_material_id: material_id,
              quantity: quantities[index]
            )
          end
        end
      end
      
      redirect_to @material, notice: 'Material was successfully created.'
    else
      @unit_of_measurements = UnitOfMeasurement.active.ordered
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    authorize! :update, @material
    @unit_of_measurements = UnitOfMeasurement.active.ordered
    @bom_components = @material.material_bom_components.includes(:component_material)
  end

  def update
    authorize! :update, @material
    if @material.update(material_params)
      # Handle BOM components
      if @material.has_bom && params[:material][:bom_component_material_ids].present?
        # Remove existing BOM components that are not in the update
        existing_ids = params[:material][:bom_component_ids] || []
        @material.material_bom_components.where.not(id: existing_ids).destroy_all
        
        # Update or create BOM components
        material_ids = params[:material][:bom_component_material_ids].reject(&:blank?)
        quantities = params[:material][:bom_component_quantities].reject(&:blank?)
        bom_ids = params[:material][:bom_component_ids] || []
        
        material_ids.each_with_index do |material_id, index|
          if quantities[index].present?
            bom_id = bom_ids[index]
            if bom_id.present?
              # Update existing
              bom_component = @material.material_bom_components.find_by(id: bom_id)
              if bom_component
                bom_component.update(
                  component_material_id: material_id,
                  quantity: quantities[index]
                )
              end
            else
              # Create new
              @material.material_bom_components.create(
                component_material_id: material_id,
                quantity: quantities[index]
              )
            end
          end
        end
      elsif !@material.has_bom
        # Remove all BOM components if has_bom is false
        @material.material_bom_components.destroy_all
      end
      
      redirect_to @material, notice: 'Material was successfully updated.'
    else
      @unit_of_measurements = UnitOfMeasurement.active.ordered
      @bom_components = @material.material_bom_components.includes(:component_material)
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :destroy, @material
    @material.destroy
    redirect_to materials_path, notice: 'Material was successfully deleted.'
  end

  def approve
    authorize! :approve, @material
    if @material.update(state: 'approved')
      redirect_to @material, notice: 'Material was successfully approved and material code generated.'
    else
      redirect_to @material, alert: 'Failed to approve material: ' + @material.errors.full_messages.join(', ')
    end
  end

  private

  def set_material
    @material = Material.find(params[:id])
  end

  def material_params
    params.require(:material).permit(:description, :procurement_unit_id, :sale_unit_id, :has_bom)
  end
end

