class UnitOfMeasurementsController < ApplicationController
  include TenantScoped

  before_action :set_material, only: [:index, :new, :create]
  before_action :set_unit_of_measurement, only: [:show, :edit, :update, :destroy]
  
  # Skip automatic authorization check since we're explicitly authorizing
  skip_authorization_check only: [:create, :create_standalone]

  def index
    authorize! :read, UnitOfMeasurement
    @unit_of_measurements = UnitOfMeasurement.active.ordered
    @material = Material.find(params[:material_id]) if params[:material_id].present?
  end
  
  def index_standalone
    authorize! :read, UnitOfMeasurement
    @unit_of_measurements = UnitOfMeasurement.active.ordered.page(params[:page]).per(20)
    @material = Material.first # For navigation context
    render :index
  end

  def show
    authorize! :read, @unit_of_measurement
  end

  def new
    authorize! :create, UnitOfMeasurement
    @unit_of_measurement = UnitOfMeasurement.new
  end

  def create
    authorize! :create, UnitOfMeasurement
    @unit_of_measurement = UnitOfMeasurement.new(unit_of_measurement_params)
    @unit_of_measurement.tenant = current_user.tenant unless current_user.super_admin?

    if @unit_of_measurement.save
      if request.format.json?
        render json: { success: true, unit: { id: @unit_of_measurement.id, name: @unit_of_measurement.display_name, display_name: @unit_of_measurement.display_name } }
      else
        material = @material || Material.first
        redirect_to material ? material_unit_of_measurements_path(material) : materials_path, notice: 'Unit of measurement was successfully created.'
      end
    else
      if request.format.json?
        render json: { success: false, errors: @unit_of_measurement.errors.full_messages }, status: :unprocessable_entity
      else
        render :new, status: :unprocessable_entity
      end
    end
  end

  def create_standalone
    authorize! :create, UnitOfMeasurement
    @unit_of_measurement = UnitOfMeasurement.new(unit_of_measurement_params)
    @unit_of_measurement.tenant = current_user.tenant unless current_user.super_admin?

    if @unit_of_measurement.save
      if request.format.json?
        render json: { success: true, unit: { id: @unit_of_measurement.id, name: @unit_of_measurement.display_name, display_name: @unit_of_measurement.display_name } }
      else
        redirect_to unit_of_measurements_path, notice: 'Unit of measurement was successfully created.'
      end
    else
      if request.format.json?
        render json: { success: false, errors: @unit_of_measurement.errors.full_messages }, status: :unprocessable_entity
      else
        render json: { success: false, errors: @unit_of_measurement.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end

  def edit
    authorize! :update, @unit_of_measurement
  end

  def update
    authorize! :update, @unit_of_measurement
    if @unit_of_measurement.update(unit_of_measurement_params)
      material = @material || Material.first
      redirect_to material ? material_unit_of_measurements_path(material) : materials_path, notice: 'Unit of measurement was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :destroy, @unit_of_measurement
    @unit_of_measurement.destroy
    material = @material || Material.first
    redirect_to material ? material_unit_of_measurements_path(material) : materials_path, notice: 'Unit of measurement was successfully deleted.'
  end

  private

  def set_material
    @material = Material.find(params[:material_id]) if params[:material_id].present?
  end

  def set_unit_of_measurement
    @unit_of_measurement = UnitOfMeasurement.find(params[:id])
    @material = Material.find(params[:material_id]) if params[:material_id].present?
  end

  def unit_of_measurement_params
    params.require(:unit_of_measurement).permit(:name, :abbreviation, :active)
  end
end

