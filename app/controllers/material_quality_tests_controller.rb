class MaterialQualityTestsController < ApplicationController
  include TenantScoped

  before_action :set_material
  before_action :set_material_quality_test, only: [:destroy]

  def index
    authorize! :read, @material
    @material_quality_tests = @material.material_quality_tests.includes(:quality_test)
    
    render json: {
      material_quality_tests: @material_quality_tests.map { |mqt|
        qt = mqt.quality_test
        {
          id: mqt.id,
          quality_test: {
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
    }
  end

  def create
    authorize! :update, @material
    
    quality_test = QualityTest.find_by(id: params[:quality_test_id])
    unless quality_test
      render json: { success: false, error: "Quality test not found" }, status: :not_found
      return
    end
    
    # Check if this quality test is already associated
    existing = @material.material_quality_tests.find_by(quality_test_id: quality_test.id)
    if existing
      render json: { success: false, error: "This quality test is already associated with this material" }, status: :unprocessable_entity
      return
    end
    
    # Create material quality test association (copy values from quality_test)
    material_quality_test = @material.material_quality_tests.build(
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
    
    if material_quality_test.save
      render json: {
        success: true,
        id: material_quality_test.id,
        quality_test: {
          id: quality_test.id,
          test_number: quality_test.test_number,
          description: quality_test.description,
          result_type: quality_test.result_type,
          lower_limit: quality_test.lower_limit,
          upper_limit: quality_test.upper_limit,
          absolute_value: quality_test.absolute_value,
          has_documents: quality_test.documents.attached?
        }
      }
    else
      render json: {
        success: false,
        error: material_quality_test.errors.full_messages.join(', ')
      }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :update, @material
    
    if @material_quality_test.destroy
      render json: { success: true }
    else
      render json: {
        success: false,
        error: "Failed to remove quality test"
      }, status: :unprocessable_entity
    end
  end

  private

  def set_material
    @material = Material.find(params[:material_id])
  end

  def set_material_quality_test
    @material_quality_test = @material.material_quality_tests.find(params[:id])
  end
end

