class MaterialBomComponentsController < ApplicationController
  include TenantScoped

  before_action :set_material

  def create
    @bom_component = @material.material_bom_components.build(bom_component_params)

    if @bom_component.save
      render json: {
        success: true,
        bom_component: {
          id: @bom_component.id,
          component_material_id: @bom_component.component_material_id,
          component_material_code: @bom_component.component_material.material_code,
          component_material_description: @bom_component.component_material.description,
          quantity: @bom_component.quantity
        }
      }
    else
      render json: {
        success: false,
        errors: @bom_component.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def destroy
    @bom_component = @material.material_bom_components.find(params[:id])
    @bom_component.destroy
    render json: { success: true }
  end

  private

  def set_material
    @material = Material.find(params[:material_id])
  end

  def bom_component_params
    params.require(:material_bom_component).permit(:component_material_id, :quantity)
  end
end

