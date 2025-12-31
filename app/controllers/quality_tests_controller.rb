class QualityTestsController < ApplicationController
  include TenantScoped

  before_action :set_quality_test, only: [:show, :edit, :update, :destroy, :remove_document]
  
  # Skip automatic authorization check since we're explicitly authorizing
  skip_authorization_check only: [:create]

  def index
    authorize! :read, QualityTest
    @quality_tests = QualityTest.all.order(:test_number).page(params[:page]).per(20)
    @material = Material.first # For navigation context
  end

  def show
    authorize! :read, @quality_test
  end

  def new
    authorize! :create, QualityTest
    @quality_test = QualityTest.new
  end

  def create
    authorize! :create, QualityTest
    
    # Check if this is an AJAX request from the material form modal
    if request.format.json?
      @quality_test = QualityTest.new(quality_test_params.except(:temp_id, :id))
      @quality_test.tenant = current_user.tenant unless current_user.super_admin?
      
      if @quality_test.save
        # Attach documents if present
        if params[:quality_test][:documents].present?
          params[:quality_test][:documents].each do |document|
            @quality_test.documents.attach(document) if document.present?
          end
        end
        
        render json: {
          success: true,
          id: @quality_test.id,
          test_number: @quality_test.test_number,
          description: @quality_test.description,
          quality_test: {
            id: @quality_test.id,
            test_number: @quality_test.test_number,
            description: @quality_test.description
          }
        }
      else
        render json: { 
          success: false, 
          errors: @quality_test.errors.full_messages,
          error: @quality_test.errors.full_messages.join(', ')
        }, status: :unprocessable_entity
      end
    else
      # Regular form submission
      # Check if we have a temporary quality test with uploaded documents
      if params[:quality_test][:temp_id].present? && params[:quality_test][:temp_id] != ""
        @quality_test = QualityTest.find_by(id: params[:quality_test][:temp_id])
        if @quality_test && @quality_test.description == "Temporary"
          @quality_test.assign_attributes(quality_test_params.except(:documents, :temp_id, :id))
        else
          @quality_test = QualityTest.new(quality_test_params.except(:temp_id, :id))
          @quality_test.tenant = current_user.tenant unless current_user.super_admin?
        end
      else
        @quality_test = QualityTest.new(quality_test_params.except(:temp_id, :id))
        @quality_test.tenant = current_user.tenant unless current_user.super_admin?
      end

      if @quality_test.save
        redirect_to quality_tests_path, notice: 'Quality test was successfully created.'
      else
        render :new, status: :unprocessable_entity
      end
    end
  end

  def edit
    authorize! :update, @quality_test
  end

  def update
    authorize! :update, @quality_test
    if @quality_test.update(quality_test_params)
      # Attach new documents if present
      if params[:quality_test][:documents].present?
        params[:quality_test][:documents].each do |document|
          @quality_test.documents.attach(document) if document.present?
        end
      end
      redirect_to quality_tests_path, notice: 'Quality test was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :destroy, @quality_test
    @quality_test.destroy
    redirect_to quality_tests_path, notice: 'Quality test was successfully deleted.'
  end

  def remove_document
    authorize! :update, @quality_test
    document = @quality_test.documents.find(params[:document_id])
    document.purge
    
    respond_to do |format|
      format.json { render json: { success: true } }
      format.html { redirect_to edit_quality_test_path(@quality_test), notice: 'Document was successfully removed.' }
    end
  end

  def upload_document
    authorize! :update, @quality_test
    
    unless params[:document].present?
      render json: { success: false, error: "No file provided" }, status: :unprocessable_entity
      return
    end
    
    begin
      @quality_test.documents.attach(params[:document])
      attached_document = @quality_test.documents.last
      
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
    rescue => e
      Rails.logger.error "Upload error: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { success: false, error: e.message }, status: :unprocessable_entity
    end
  end

  def upload_document_new
    authorize! :create, QualityTest
    
    unless params[:document].present?
      render json: { success: false, error: "No file provided" }, status: :unprocessable_entity
      return
    end
    
    # Check if we already have a temporary quality test
    if params[:temp_id].present? && params[:temp_id] != ""
      @quality_test = QualityTest.find_by(id: params[:temp_id])
      # Verify it's actually a temporary test for this tenant
      if @quality_test && @quality_test.description == "Temporary"
        # Check tenant match for security
        if current_user.super_admin? || @quality_test.tenant_id == current_user.tenant_id
          # Good, we can use this existing temporary test
        else
          @quality_test = nil
        end
      else
        @quality_test = nil
      end
    end
    
    # Create a temporary quality test if we don't have one
    unless @quality_test
      @quality_test = QualityTest.new
      @quality_test.tenant = current_user.tenant unless current_user.super_admin?
      @quality_test.description = "Temporary" # Will be updated when form is saved
      @quality_test.result_type = :boolean # Default, will be updated when form is saved
      
      # Generate test number if needed
      @quality_test.valid? # This triggers test number generation
      
      unless @quality_test.save(validate: false)
        render json: { success: false, error: "Failed to create temporary quality test: #{@quality_test.errors.full_messages.join(', ')}" }, status: :unprocessable_entity
        return
      end
    end
    
    begin
      # Attach the document to the existing quality test (this will add to existing attachments)
      @quality_test.documents.attach(params[:document])
      
      # Reload to get all attached documents
      @quality_test.reload
      
      # Find the newly attached document
      attached_document = @quality_test.documents.order(created_at: :desc).first
      
      # If we can't find it, try to get the last one
      if attached_document.nil? && @quality_test.documents.attached?
        attached_document = @quality_test.documents.last
      end
      
      if attached_document.nil?
        render json: { success: false, error: "Failed to attach document" }, status: :unprocessable_entity
        return
      end
      
      render json: {
        success: true,
        quality_test_id: @quality_test.id,
        document: {
          id: attached_document.id,
          filename: attached_document.filename.to_s,
          size: attached_document.byte_size,
          url: rails_blob_path(attached_document, disposition: "attachment")
        }
      }
    rescue => e
      Rails.logger.error "Upload error: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { success: false, error: e.message }, status: :unprocessable_entity
    end
  end

  private

  def set_quality_test
    @quality_test = QualityTest.find(params[:id])
  end

  def quality_test_params
    params.require(:quality_test).permit(:description, :result_type, :lower_limit, :upper_limit, :absolute_value, :temp_id, :id, documents: [])
  end
end
