class SalesOrdersController < ApplicationController
  include TenantScoped

  before_action :set_sales_order, only: [:show, :edit, :update, :destroy, :confirm, :mark_dispatched, 
                                        :complete, :cancel, :upload_document, :remove_document]

  def index
    authorize! :read, SalesOrder
    @sales_orders = SalesOrder.all.includes(:customer)
    
    @sales_orders = @sales_orders.by_state(params[:state]) if params[:state].present?
    @sales_orders = @sales_orders.by_customer(params[:customer_id]) if params[:customer_id].present?
    
    if params[:start_date].present? && params[:end_date].present?
      @sales_orders = @sales_orders.date_range(params[:start_date], params[:end_date])
    end
    
    if params[:search].present?
      search_term = params[:search]
      @sales_orders = @sales_orders.where(
        "sale_order_number ILIKE ? OR purchase_order_number ILIKE ?",
        "%#{search_term}%", "%#{search_term}%"
      )
    end
    
    @sales_orders = @sales_orders.order(created_at: :desc)
    @sales_orders = @sales_orders.page(params[:page]).per(20)
    
    @customers = Customer.active.order(:name) if current_user.has_functionality?('sales_management')
  end

  def show
    authorize! :read, @sales_order
    @line_items = @sales_order.sales_order_line_items.includes(:material)
  end

  def new
    authorize! :create, SalesOrder
    @sales_order = SalesOrder.new
    @sales_order.purchase_order_date = Date.today
    @customers = Customer.active.order(:name)
    @materials = Material.approved.order(:material_code)
  end

  def create
    authorize! :create, SalesOrder
    @sales_order = SalesOrder.new(sales_order_params)
    @sales_order.tenant = current_user.tenant unless current_user.super_admin?
    @sales_order.state = 'draft'

    if @sales_order.save
      # Handle line items
      if params[:sales_order][:line_items].present?
        params[:sales_order][:line_items].each_value do |line_item_params|
          next if line_item_params[:material_id].blank?
          
          @sales_order.sales_order_line_items.create(
            material_id: line_item_params[:material_id],
            quantity: line_item_params[:quantity],
            unit_price: line_item_params[:unit_price],
            discount_percentage: line_item_params[:discount_percentage] || 0,
            tax_percentage: line_item_params[:tax_percentage] || 0,
            dispatch_date: line_item_params[:dispatch_date],
            notes: line_item_params[:notes]
          )
        end
      end
      
      redirect_to @sales_order, notice: 'Sales order was successfully created.'
    else
      @customers = Customer.active.order(:name)
      @materials = Material.approved.order(:material_code)
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    authorize! :update, @sales_order
    unless @sales_order.draft?
      redirect_to @sales_order, alert: 'Only draft orders can be edited.'
      return
    end
    @customers = Customer.active.order(:name)
    @materials = Material.approved.order(:material_code)
    @line_items = @sales_order.sales_order_line_items.includes(:material)
  end

  def update
    authorize! :update, @sales_order
    unless @sales_order.draft?
      redirect_to @sales_order, alert: 'Only draft orders can be edited.'
      return
    end

    if @sales_order.update(sales_order_params)
      # Update or create line items
      if params[:sales_order][:line_items].present?
        # Delete existing line items
        @sales_order.sales_order_line_items.destroy_all
        
        # Create new line items
        params[:sales_order][:line_items].each_value do |line_item_params|
          next if line_item_params[:material_id].blank?
          
          @sales_order.sales_order_line_items.create(
            material_id: line_item_params[:material_id],
            quantity: line_item_params[:quantity],
            unit_price: line_item_params[:unit_price],
            discount_percentage: line_item_params[:discount_percentage] || 0,
            tax_percentage: line_item_params[:tax_percentage] || 0,
            dispatch_date: line_item_params[:dispatch_date],
            notes: line_item_params[:notes]
          )
        end
      end
      
      redirect_to @sales_order, notice: 'Sales order was successfully updated.'
    else
      @customers = Customer.active.order(:name)
      @materials = Material.approved.order(:material_code)
      @line_items = @sales_order.sales_order_line_items.includes(:material)
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :destroy, @sales_order
    unless @sales_order.draft?
      redirect_to sales_orders_path, alert: 'Only draft orders can be deleted.'
      return
    end
    
    @sales_order.destroy
    redirect_to sales_orders_path, notice: 'Sales order was successfully deleted.'
  end

  def confirm
    authorize! :confirm, @sales_order
    if @sales_order.confirm!(current_user)
      redirect_to @sales_order, notice: 'Sales order was successfully confirmed.'
    else
      redirect_to @sales_order, alert: 'Sales order cannot be confirmed.'
    end
  end

  def mark_dispatched
    authorize! :dispatch, @sales_order
    if @sales_order.dispatch!
      redirect_to @sales_order, notice: 'Sales order was successfully dispatched.'
    else
      redirect_to @sales_order, alert: 'Sales order cannot be dispatched.'
    end
  end

  def complete
    authorize! :complete, @sales_order
    if @sales_order.complete!
      redirect_to @sales_order, notice: 'Sales order was successfully completed.'
    else
      redirect_to @sales_order, alert: 'Sales order cannot be completed.'
    end
  end

  def cancel
    authorize! :cancel, @sales_order
    if @sales_order.cancel!(current_user)
      redirect_to @sales_order, notice: 'Sales order was successfully cancelled.'
    else
      redirect_to @sales_order, alert: 'Sales order cannot be cancelled.'
    end
  end

  def search_materials
    authorize! :read, SalesOrder
    query = params[:q] || ''
    @materials = Material.approved.searchable(query).limit(10)
    
    render json: {
      materials: @materials.map { |m| 
        { 
          id: m.id, 
          material_code: m.material_code || 'Draft', 
          description: m.description,
          sale_unit: m.sale_unit&.abbreviation || 'N/A'
        } 
      }
    }
  end

  def upload_document
    authorize! :update, @sales_order
    request.format = :json
    
    unless params[:document].present?
      render json: { success: false, error: "No file provided" }, status: :unprocessable_entity
      return
    end
    
    begin
      filename = params[:document].original_filename
      existing_filenames = @sales_order.documents.attached? ? @sales_order.documents.map { |doc| doc.filename.to_s } : []
      
      if existing_filenames.include?(filename)
        render json: { success: false, error: "A document with the same filename already exists" }, status: :unprocessable_entity
        return
      end
      
      @sales_order.documents.attach(params[:document])
      @sales_order.reload
      attached_document = @sales_order.documents.order(created_at: :desc).first
      
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
      render json: { success: false, error: e.message }, status: :unprocessable_entity
    end
  end

  def remove_document
    authorize! :update, @sales_order
    document = @sales_order.documents.find(params[:document_id])
    document.purge
    
    respond_to do |format|
      format.html { redirect_to @sales_order, notice: 'Document was successfully removed.' }
      format.json { render json: { success: true } }
    end
  rescue ActiveRecord::RecordNotFound
    respond_to do |format|
      format.html { redirect_to @sales_order, alert: 'Document not found.' }
      format.json { render json: { success: false, error: 'Document not found.' }, status: :not_found }
    end
  end

  private

  def set_sales_order
    @sales_order = SalesOrder.find(params[:id])
  end

  def sales_order_params
    params.require(:sales_order).permit(:customer_id, :purchase_order_number, :purchase_order_date,
                                        :currency, :partial_dispatch_allowed, :remarks, :discount_amount,
                                        :tax_amount)
  end
end

