class CustomersController < ApplicationController
  include TenantScoped

  before_action :set_customer, only: [:show, :edit, :update, :destroy, :toggle_active]

  def index
    authorize! :read, Customer
    @customers = Customer.all
    
    @customers = @customers.active if params[:status] == 'active'
    @customers = @customers.inactive if params[:status] == 'inactive'
    @customers = @customers.searchable(params[:search]) if params[:search].present?
    @customers = @customers.order(created_at: :desc)
    @customers = @customers.page(params[:page]).per(20)
    
    respond_to do |format|
      format.html
      format.json do
        customers_html = render_to_string(partial: 'customers_list', locals: { customers: @customers }, formats: [:html])
        pagination_html = render_to_string(partial: 'pagination', locals: { customers: @customers }, formats: [:html])
        render json: { customers: customers_html, pagination: pagination_html }
      end
    end
  end

  def search
    authorize! :read, Customer
    query = params[:q] || ''
    @customers = Customer.searchable(query).active.limit(10)
    
    render json: {
      customers: @customers.map { |c| 
        primary_contact = c.customer_contacts.first
        { 
          id: c.id, 
          customer_code: c.customer_code || 'Draft', 
          name: c.name,
          email: primary_contact&.email,
          phone: primary_contact&.phone
        } 
      }
    }
  end

  def show
    authorize! :read, @customer
    @sales_orders = @customer.sales_orders.order(created_at: :desc).limit(10)
  end

  def new
    authorize! :create, Customer
    @customer = Customer.new
    # default_currency has a default value of 'INR' in the database
  end

  def create
    authorize! :create, Customer
    @customer = Customer.new(customer_params)
    @customer.tenant = current_user.tenant unless current_user.super_admin?

    if @customer.save
      redirect_to @customer, notice: 'Customer was successfully created.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    authorize! :update, @customer
  end

  def update
    authorize! :update, @customer
    if @customer.update(customer_params)
      redirect_to @customer, notice: 'Customer was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize! :destroy, @customer
    if @customer.sales_orders.any?
      redirect_to customers_path, alert: 'Cannot delete customer that has sales orders.'
    else
      @customer.destroy
      redirect_to customers_path, notice: 'Customer was successfully deleted.'
    end
  end

  def toggle_active
    authorize! :toggle_active, @customer
    @customer.update(active: !@customer.active)
    status = @customer.active? ? 'activated' : 'deactivated'
    redirect_to @customer, notice: "Customer was successfully #{status}."
  end

  private

  def set_customer
    @customer = Customer.find(params[:id])
  end

  def customer_params
    params.require(:customer).permit(:name, :default_currency, :tax_id, :credit_limit, :active,
                                      :billing_street_address, :billing_city, :billing_state, 
                                      :billing_postal_code, :billing_country,
                                      customer_contacts_attributes: [:id, :name, :email, :phone, :remarks, :_destroy],
                                      customer_shipping_addresses_attributes: [:id, :name, :street_address, 
                                      :city, :state, :postal_code, :country, :is_default, :remarks, :_destroy])
  end
end

