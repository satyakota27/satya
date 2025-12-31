class MaterialProcessStepsController < ApplicationController
  include TenantScoped

  before_action :set_material
  before_action :set_material_process_step, only: [:destroy]

  def index
    authorize! :read, @material
    @material_process_steps = @material.material_process_steps.includes(:process_step)
    
    render json: {
      material_process_steps: @material_process_steps.map { |mps|
        ps = mps.process_step
        {
          id: mps.id,
          process_step: {
            id: ps.id,
            process_code: ps.process_code,
            description: ps.description,
            estimated_days: ps.estimated_days,
            estimated_hours: ps.estimated_hours,
            estimated_minutes: ps.estimated_minutes,
            estimated_seconds: ps.estimated_seconds,
            has_documents: ps.documents.attached?
          }
        }
      }
    }
  end

  def create
    authorize! :update, @material
    
    process_step = ProcessStep.find_by(id: params[:process_step_id])
    unless process_step
      render json: { success: false, error: "Process step not found" }, status: :not_found
      return
    end
    
    # Check if this process step is already associated
    existing = @material.material_process_steps.find_by(process_step_id: process_step.id)
    if existing
      render json: { success: false, error: "This process step is already associated with this material" }, status: :unprocessable_entity
      return
    end
    
    # Create material process step association
    material_process_step = @material.material_process_steps.build(
      process_step: process_step
    )
    
    if material_process_step.save
      render json: {
        success: true,
        id: material_process_step.id,
        process_step: {
          id: process_step.id,
          process_code: process_step.process_code,
          description: process_step.description,
          estimated_days: process_step.estimated_days,
          estimated_hours: process_step.estimated_hours,
          estimated_minutes: process_step.estimated_minutes,
          estimated_seconds: process_step.estimated_seconds,
          has_documents: process_step.documents.attached?
        }
      }
    else
      render json: {
        success: false,
        error: material_process_step.errors.full_messages.join(', ')
      }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :update, @material
    
    if @material_process_step.destroy
      render json: { success: true }
    else
      render json: {
        success: false,
        error: "Failed to remove process step"
      }, status: :unprocessable_entity
    end
  end

  private

  def set_material
    @material = Material.find(params[:material_id])
  end

  def set_material_process_step
    @material_process_step = @material.material_process_steps.find(params[:id])
  end
end

