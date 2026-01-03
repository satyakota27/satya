class SalesOrderLineItemsController < ApplicationController
  include TenantScoped

  before_action :set_sales_order
  before_action :set_line_item, only: [:update, :destroy]

  def create
    authorize! :update, @sales_order
    @line_item = @sales_order.sales_order_line_items.build(line_item_params)

    if @line_item.save
      @sales_order.reload
      @sales_order.calculate_totals
      @sales_order.save
      
      render json: {
        success: true,
        line_item: {
          id: @line_item.id,
          material_code: @line_item.material.material_code,
          material_description: @line_item.material.description,
          quantity: @line_item.quantity,
          unit_price: @line_item.unit_price,
          line_total: @line_item.line_total,
          dispatch_date: @line_item.dispatch_date
        },
        order_total: @sales_order.total_amount
      }
    else
      render json: { success: false, errors: @line_item.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    authorize! :update, @sales_order
    if @line_item.update(line_item_params)
      @sales_order.reload
      @sales_order.calculate_totals
      @sales_order.save
      
      render json: {
        success: true,
        line_item: {
          id: @line_item.id,
          material_code: @line_item.material.material_code,
          material_description: @line_item.material.description,
          quantity: @line_item.quantity,
          unit_price: @line_item.unit_price,
          line_total: @line_item.line_total,
          dispatch_date: @line_item.dispatch_date
        },
        order_total: @sales_order.total_amount
      }
    else
      render json: { success: false, errors: @line_item.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :update, @sales_order
    @line_item.destroy
    @sales_order.reload
    @sales_order.calculate_totals
    @sales_order.save
    
    render json: {
      success: true,
      order_total: @sales_order.total_amount
    }
  end

  private

  def set_sales_order
    @sales_order = SalesOrder.find(params[:sales_order_id])
  end

  def set_line_item
    @line_item = @sales_order.sales_order_line_items.find(params[:id])
  end

  def line_item_params
    params.require(:sales_order_line_item).permit(:material_id, :quantity, :unit_price,
                                                   :discount_percentage, :tax_percentage,
                                                   :dispatch_date, :notes, :dispatched_quantity)
  end
end

