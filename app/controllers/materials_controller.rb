class MaterialsController < ApplicationController
  include TenantScoped

  before_action :set_material, only: [:show, :edit, :update, :destroy, :approve]

  def index
    authorize! :read, Material
    @materials = Material.all
    
    # Material approvers should not see rejected materials in the listing
    # (they can only see draft materials for approval)
    if current_user.has_permission?('material_approver') && !current_user.super_admin?
      @materials = @materials.where.not(state: 'rejected')
    end
    
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
    @materials = Material.searchable(query)
    
    # If searching for BOM components, only return approved materials
    if params[:bom_search] == 'true'
      @materials = @materials.where(state: 'approved')
    end
    
    @materials = @materials.limit(10)
    
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

  def quality_tests_search
    authorize! :read, Material
    query = params[:q] || ''
    @quality_tests = QualityTest.searchable(query).limit(10)
    
    render json: {
      quality_tests: @quality_tests.map { |qt| 
        { 
          id: qt.id, 
          test_number: qt.test_number, 
          description: qt.description,
          result_type: qt.result_type,
          lower_limit: qt.lower_limit,
          upper_limit: qt.upper_limit,
          absolute_value: qt.absolute_value,
          has_documents: qt.documents.attached?
        } 
      }
    }
  end

  def process_steps_search
    authorize! :read, Material
    query = params[:q] || ''
    @process_steps = ProcessStep.searchable(query).limit(10)
    
    render json: {
      process_steps: @process_steps.map { |ps| 
        { 
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
  end

  def show
    authorize! :read, @material
    @bom_components = @material.material_bom_components.includes(:component_material) if @material.has_bom
    @material_quality_tests = @material.material_quality_tests.includes(:quality_test)
    @material_process_steps = @material.material_process_steps.includes(:process_step)
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
      
      # Handle Quality Tests
      handle_quality_tests(@material, params)
      
      # Handle Process Steps
      handle_process_steps(@material, params)
      
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
    @material_quality_tests = @material.material_quality_tests.includes(:quality_test)
  end

  def update
    authorize! :update, @material
    update_params = material_params.dup
    was_rejected = @material.rejected?
    
    # If material is rejected and being updated, reset to draft state and clear rejection info
    if was_rejected
      update_params[:state] = 'draft'
      update_params[:approver_comments] = nil
      update_params[:rejected_by_id] = nil
      update_params[:rejected_at] = nil
    end
    
    if @material.update(update_params)
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
      
      # Handle Quality Tests
      handle_quality_tests(@material, params)
      
      # Handle Process Steps
      handle_process_steps(@material, params)
      
      notice_message = if was_rejected
        'Material has been updated and moved back to draft state. Please resubmit for approval.'
      else
        'Material was successfully updated.'
      end
      
      redirect_to @material, notice: notice_message
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
    comments = params[:approver_comments] || params.dig(:material, :approver_comments)
    
    if @material.update(
      state: 'approved',
      approver_comments: comments,
      approved_by: current_user,
      approved_at: Time.current
    )
      redirect_to @material, notice: 'Material was successfully approved and material code generated.'
    else
      redirect_to @material, alert: 'Failed to approve material: ' + @material.errors.full_messages.join(', ')
    end
  end

  def reject
    authorize! :reject, @material
    comments = params[:approver_comments] || params.dig(:material, :approver_comments) || params.dig(:approver_comments)
    
    if comments.blank?
      redirect_to @material, alert: 'Comments are required when rejecting a material.'
      return
    end
    
    result = @material.update(
      state: 'rejected',
      approver_comments: comments,
      rejected_by: current_user,
      rejected_at: Time.current
    )
    
    if result
      redirect_to @material, notice: 'Material was successfully rejected.'
    else
      redirect_to @material, alert: 'Failed to reject material: ' + @material.errors.full_messages.join(', ')
    end
  end

  private

  def set_material
    @material = Material.find(params[:id])
  end

  def material_params
    params.require(:material).permit(:description, :procurement_unit_id, :sale_unit_id, :tracking_type, :sample_size,
      :has_bom, :has_shelf_life, 
      :shelf_life_years, :shelf_life_months, :shelf_life_weeks, :shelf_life_days, 
      :shelf_life_hours, :shelf_life_minutes, :shelf_life_seconds, 
      :has_minimum_stock_value, :minimum_stock_value, :has_minimum_reorder_value, :minimum_reorder_value,
      :state, :approver_comments, :rejected_by_id, :rejected_at, :approved_by_id, :approved_at,
      quality_test_documents: {}, process_step_ids: [])
  end

  def handle_quality_tests(material, params)
    return unless params[:material].present?
    
    quality_test_ids = params[:material][:quality_test_ids] || []
    
    # Remove all existing quality tests first
    material.material_quality_tests.destroy_all
    
    # Associate quality tests with material
    quality_test_ids.each do |test_id|
      next if test_id.blank?
      
      quality_test = QualityTest.find_by(id: test_id)
      next unless quality_test
      
      # Create material quality test association (copy values from quality_test)
      material_quality_test = material.material_quality_tests.build(
        quality_test: quality_test,
        result_type: quality_test.result_type || 'boolean'
      )
      
      # Copy limit/value fields based on result type
      if quality_test.range?
        material_quality_test.lower_limit = quality_test.lower_limit
        material_quality_test.upper_limit = quality_test.upper_limit
      elsif quality_test.absolute?
        material_quality_test.absolute_value = quality_test.absolute_value
      end
      
      material_quality_test.save!
    end
  end

  def handle_process_steps(material, params)
    return unless params[:material].present?
    
    process_step_ids = params[:material][:process_step_ids] || []
    
    # Remove all existing process steps first
    material.material_process_steps.destroy_all
    
    # Associate process steps with material
    process_step_ids.each do |step_id|
      next if step_id.blank?
      
      process_step = ProcessStep.find_by(id: step_id)
      next unless process_step
      
      # Create material process step association
      material.material_process_steps.create(process_step: process_step)
    end
  end
end

