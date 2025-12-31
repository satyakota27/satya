class ProcessStepsController < ApplicationController
  include TenantScoped

  before_action :set_process_step, only: [:show, :edit, :update, :destroy, :remove_document, :upload_document]
  
  # Skip automatic authorization check since we're explicitly authorizing
  skip_authorization_check only: [:create, :upload_document, :upload_document_new]

  def index
    authorize! :read, ProcessStep
    @process_steps = ProcessStep.all.order(:process_code).page(params[:page]).per(20)
    @material = Material.first # For navigation context
  end

  def show
    authorize! :read, @process_step
  end

  def new
    authorize! :create, ProcessStep
    @process_step = ProcessStep.new
  end

  def create
    authorize! :create, ProcessStep
    
    # Check if this is an AJAX request from the material form modal
    if request.format.json?
      @process_step = ProcessStep.new(process_step_params.except(:temp_id, :id, :quality_test_ids))
      @process_step.tenant = current_user.tenant unless current_user.super_admin?
      
      if @process_step.save
        # Attach documents if present (with duplicate prevention)
        if params[:process_step][:documents].present?
          existing_filenames = @process_step.documents.attached? ? @process_step.documents.map { |doc| doc.filename.to_s } : []
          
          params[:process_step][:documents].each do |document|
            if document.present?
              # Check if document with same filename already exists to prevent duplicates
              unless existing_filenames.include?(document.original_filename)
                @process_step.documents.attach(document)
                existing_filenames << document.original_filename
              end
            end
          end
        end
        
        # Handle Quality Tests
        begin
          handle_quality_tests(@process_step, process_step_params)
        rescue => e
          render json: { 
            success: false, 
            errors: @process_step.errors.full_messages + [e.message],
            error: "Failed to save quality tests: #{e.message}"
          }, status: :unprocessable_entity
          return
        end
        
        render json: {
          success: true,
          id: @process_step.id,
          process_code: @process_step.process_code,
          description: @process_step.description,
          process_step: {
            id: @process_step.id,
            process_code: @process_step.process_code,
            description: @process_step.description
          }
        }
      else
        render json: { 
          success: false, 
          errors: @process_step.errors.full_messages,
          error: @process_step.errors.full_messages.join(', ')
        }, status: :unprocessable_entity
      end
    else
      # Regular form submission
      # Check if we have a temporary process step with uploaded documents
      if params[:process_step][:temp_id].present? && params[:process_step][:temp_id] != ""
        @process_step = ProcessStep.find_by(id: params[:process_step][:temp_id])
        if @process_step && @process_step.description == "Temporary"
          @process_step.assign_attributes(process_step_params.except(:documents, :temp_id, :id, :quality_test_ids))
        else
          @process_step = ProcessStep.new(process_step_params.except(:temp_id, :id, :quality_test_ids))
          @process_step.tenant = current_user.tenant unless current_user.super_admin?
        end
      else
        @process_step = ProcessStep.new(process_step_params.except(:temp_id, :id, :quality_test_ids))
        @process_step.tenant = current_user.tenant unless current_user.super_admin?
      end

      if @process_step.save
        # Attach documents from form if present (only for new process steps without temp_id)
        # Documents are already attached for temp_id cases via AJAX uploads
        if params[:process_step][:documents].present? && !params[:process_step][:temp_id].present?
          existing_filenames = @process_step.documents.attached? ? @process_step.documents.map { |doc| doc.filename.to_s } : []
          
          params[:process_step][:documents].each do |document|
            if document.present?
              # Check if document with same filename already exists to prevent duplicates
              unless existing_filenames.include?(document.original_filename)
                @process_step.documents.attach(document)
                existing_filenames << document.original_filename
              end
            end
          end
        end
        
        # Handle Quality Tests
        begin
          handle_quality_tests(@process_step, process_step_params)
        rescue => e
          flash.now[:alert] = "Process step was created but failed to save quality tests: #{e.message}"
          render :new, status: :unprocessable_entity
          return
        end
        
        redirect_to process_steps_path, notice: 'Process step was successfully created.'
      else
        render :new, status: :unprocessable_entity
      end
    end
  end

  def edit
    authorize! :update, @process_step
  end

  def update
    authorize! :update, @process_step
    
    # Exclude documents from update params to prevent replacing existing documents
    update_params = process_step_params.except(:documents, :quality_test_ids)
    
    if @process_step.update(update_params)
      # Attach new documents if present (only attach files that aren't already attached)
      if params[:process_step][:documents].present?
        existing_filenames = @process_step.documents.attached? ? @process_step.documents.map { |doc| doc.filename.to_s } : []
        
        params[:process_step][:documents].each do |document|
          if document.present?
            # Check if document with same filename already exists to prevent duplicates
            unless existing_filenames.include?(document.original_filename)
              @process_step.documents.attach(document)
              existing_filenames << document.original_filename
            end
          end
        end
      end
      
      # Handle Quality Tests
      begin
        handle_quality_tests(@process_step, process_step_params)
      rescue => e
        flash.now[:alert] = "Process step was updated but failed to save quality tests: #{e.message}"
        render :edit, status: :unprocessable_entity
        return
      end
      
      redirect_to process_steps_path, notice: 'Process step was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :destroy, @process_step
    @process_step.destroy
    redirect_to process_steps_path, notice: 'Process step was successfully deleted.'
  end

  def search
    authorize! :read, ProcessStep
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

  def remove_document
    authorize! :update, @process_step
    
    begin
      document = @process_step.documents.find_by(id: params[:document_id])
      
      if document.nil?
        respond_to do |format|
          format.json { render json: { success: false, error: "Document not found" }, status: :not_found }
          format.html { redirect_to edit_process_step_path(@process_step), alert: 'Document not found.' }
        end
        return
      end
      
      document.purge
      
      respond_to do |format|
        format.json { render json: { success: true } }
        format.html { redirect_to edit_process_step_path(@process_step), notice: 'Document was successfully removed.' }
      end
    rescue => e
      Rails.logger.error "Remove document error: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      respond_to do |format|
        format.json { render json: { success: false, error: e.message }, status: :unprocessable_entity }
        format.html { redirect_to edit_process_step_path(@process_step), alert: 'Failed to remove document.' }
      end
    end
  end

  def upload_document
    # Force JSON format
    request.format = :json
    
    # Check authorization - use authorize! so CanCan knows we performed authorization
    # But handle JSON response ourselves
    begin
      authorize! :update, @process_step
    rescue CanCan::AccessDenied => e
      render json: { success: false, error: "You are not authorized to perform this action" }, status: :forbidden
      return
    end
    
    unless params[:document].present?
      render json: { success: false, error: "No file provided" }, status: :unprocessable_entity
      return
    end
    
    begin
      # Check for duplicate filename to prevent duplicates
      filename = params[:document].original_filename
      existing_filenames = @process_step.documents.attached? ? @process_step.documents.map { |doc| doc.filename.to_s } : []
      
      if existing_filenames.include?(filename)
        render json: { success: false, error: "A document with the same filename already exists" }, status: :unprocessable_entity
        return
      end
      
      @process_step.documents.attach(params[:document])
      
      # Reload to get the newly attached document
      @process_step.reload
      attached_document = @process_step.documents.order(created_at: :desc).first
      
      if attached_document.nil?
        render json: { success: false, error: "Failed to attach document" }, status: :unprocessable_entity
        return
      end
      
      render json: {
        success: true,
        document: {
          id: attached_document.id,
          filename: attached_document.filename.to_s,
          size: attached_document.byte_size,
          url: rails_blob_path(attached_document, disposition: "attachment")
        }
      }
    rescue ActiveRecord::RecordNotFound => e
      Rails.logger.error "Upload error - Record not found: #{e.message}"
      render json: { success: false, error: "Process step not found" }, status: :not_found
    rescue => e
      Rails.logger.error "Upload error: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { success: false, error: e.message }, status: :unprocessable_entity
    end
  end

  def upload_document_new
    # Force JSON format
    request.format = :json
    
    # Check authorization - use authorize! so CanCan knows we performed authorization
    # But handle JSON response ourselves
    begin
      authorize! :create, ProcessStep
    rescue CanCan::AccessDenied => e
      render json: { success: false, error: "You are not authorized to perform this action" }, status: :forbidden
      return
    end
    
    unless params[:document].present?
      render json: { success: false, error: "No file provided" }, status: :unprocessable_entity
      return
    end
    
    begin
      # Check if we already have a temporary process step
      if params[:temp_id].present? && params[:temp_id] != ""
        @process_step = ProcessStep.find_by(id: params[:temp_id])
        # Verify it's actually a temporary step for this tenant
        if @process_step && @process_step.description == "Temporary"
          # Check tenant match for security
          if current_user.super_admin? || @process_step.tenant_id == current_user.tenant_id
            # Good, we can use this existing temporary step
          else
            @process_step = nil
          end
        else
          @process_step = nil
        end
      end
      
      # Create a temporary process step if we don't have one
      unless @process_step
        @process_step = ProcessStep.new
        @process_step.tenant = current_user.tenant unless current_user.super_admin?
        @process_step.description = "Temporary" # Will be updated when form is saved
        
        # Generate process code if needed
        @process_step.valid? # This triggers process code generation
        
        unless @process_step.save(validate: false)
          render json: { success: false, error: "Failed to create temporary process step: #{@process_step.errors.full_messages.join(', ')}" }, status: :unprocessable_entity
          return
        end
      end
      
      # Check for duplicate filename to prevent duplicates
      filename = params[:document].original_filename
      existing_filenames = @process_step.documents.attached? ? @process_step.documents.map { |doc| doc.filename.to_s } : []
      
      if existing_filenames.include?(filename)
        render json: { success: false, error: "A document with the same filename already exists" }, status: :unprocessable_entity
        return
      end
      
      # Attach the document to the existing process step (this will add to existing attachments)
      @process_step.documents.attach(params[:document])
      
      # Reload to get all attached documents
      @process_step.reload
      
      # Find the newly attached document
      attached_document = @process_step.documents.order(created_at: :desc).first
      
      # If we can't find it, try to get the last one
      if attached_document.nil? && @process_step.documents.attached?
        attached_document = @process_step.documents.last
      end
      
      if attached_document.nil?
        render json: { success: false, error: "Failed to attach document" }, status: :unprocessable_entity
        return
      end
      
      render json: {
        success: true,
        process_step_id: @process_step.id,
        document: {
          id: attached_document.id,
          filename: attached_document.filename.to_s,
          size: attached_document.byte_size,
          url: rails_blob_path(attached_document, disposition: "attachment")
        }
      }
    rescue ActiveRecord::RecordInvalid => e
      Rails.logger.error "Upload error - Validation failed: #{e.message}"
      render json: { success: false, error: e.record.errors.full_messages.join(', ') }, status: :unprocessable_entity
    rescue => e
      Rails.logger.error "Upload error: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { success: false, error: e.message }, status: :unprocessable_entity
    end
  end

  private

  def set_process_step
    @process_step = ProcessStep.find(params[:id])
  end

  def process_step_params
    params.require(:process_step).permit(:description, :estimated_days, :estimated_hours, :estimated_minutes, :estimated_seconds, :temp_id, :id, documents: [], quality_test_ids: [])
  end

  def handle_quality_tests(process_step, permitted_params)
    return unless permitted_params.present?
    
    quality_test_ids = permitted_params[:quality_test_ids] || []
    quality_test_ids = quality_test_ids.reject(&:blank?)
    
    # Use a transaction to ensure atomicity
    ProcessStepQualityTest.transaction do
      # Get current quality test IDs
      current_test_ids = process_step.process_step_quality_tests.pluck(:quality_test_id)
      
      # Find IDs to remove (current but not in new list)
      ids_to_remove = current_test_ids - quality_test_ids.map(&:to_i)
      
      # Find IDs to add (in new list but not current)
      ids_to_add = quality_test_ids.map(&:to_i) - current_test_ids
      
      # Remove associations that are no longer needed
      if ids_to_remove.any?
        process_step.process_step_quality_tests.where(quality_test_id: ids_to_remove).destroy_all
      end
      
      # Add new associations
      ids_to_add.each do |test_id|
        quality_test = QualityTest.find_by(id: test_id)
        if quality_test
          # Use create! to raise errors if any occur
          process_step.process_step_quality_tests.create!(quality_test: quality_test)
        else
          # Raise an error if the quality test doesn't exist
          raise ActiveRecord::RecordNotFound, "Quality test with ID #{test_id} not found"
        end
      end
    end
    
  rescue ActiveRecord::RecordInvalid => e
    # Log the error and add to the process step errors
    Rails.logger.error "Failed to save quality test associations: #{e.message}"
    process_step.errors.add(:quality_tests, "Failed to save quality test associations: #{e.message}")
    raise e
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.error "Quality test not found: #{e.message}"
    process_step.errors.add(:quality_tests, "One or more quality tests were not found")
    raise e
  rescue => e
    Rails.logger.error "Unexpected error in handle_quality_tests: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    process_step.errors.add(:quality_tests, "An unexpected error occurred while saving quality tests")
    raise e
  end
end

