class SalesOrder < ApplicationRecord
  include TenantIsolated

  acts_as_tenant :tenant

  belongs_to :tenant
  belongs_to :customer
  has_many :sales_order_line_items, dependent: :destroy
  has_many :materials, through: :sales_order_line_items
  has_many_attached :documents
  belongs_to :confirmed_by, class_name: 'User', optional: true
  belongs_to :cancelled_by, class_name: 'User', optional: true

  enum :state, {
    draft: 'draft',
    confirmed: 'confirmed',
    dispatched: 'dispatched',
    completed: 'completed',
    cancelled: 'cancelled'
  }

  validates :customer, presence: true
  validates :purchase_order_date, presence: true
  validates :purchase_order_number, presence: true
  validates :sale_order_number, uniqueness: { scope: :tenant_id }, allow_nil: true
  validates :currency, presence: true
  validate :has_line_items, on: :update, if: -> { state_changed? && (confirmed? || dispatched?) }

  before_validation :generate_sale_order_number, on: :create
  before_save :calculate_totals

  scope :by_state, ->(state) { where(state: state) if state.present? }
  scope :by_customer, ->(customer_id) { where(customer_id: customer_id) if customer_id.present? }
  scope :date_range, ->(start_date, end_date) {
    where(purchase_order_date: start_date..end_date) if start_date.present? && end_date.present?
  }

  def can_confirm?
    draft? && sales_order_line_items.any?
  end

  def can_dispatch?
    confirmed? && sales_order_line_items.any?
  end

  def can_complete?
    dispatched? && all_items_dispatched?
  end

  def can_cancel?
    draft? || confirmed? || dispatched?
  end

  def all_items_dispatched?
    return false if sales_order_line_items.empty?
    sales_order_line_items.all? { |item| item.fully_dispatched? }
  end

  def calculate_totals
    self.subtotal = sales_order_line_items.sum(&:line_total)
    # Total is subtotal - discount_amount + tax_amount
    # Discount and tax are calculated at order level if needed, or from line items
    self.total_amount = subtotal - discount_amount + tax_amount
  end

  def confirm!(user)
    return false unless can_confirm?
    
    update!(
      state: :confirmed,
      confirmed_at: Time.current,
      confirmed_by: user
    )
  end

  def dispatch!
    return false unless can_dispatch?
    
    update!(
      state: :dispatched,
      dispatched_at: Time.current
    )
  end

  def complete!
    return false unless can_complete?
    
    update!(
      state: :completed,
      completed_at: Time.current
    )
  end

  def cancel!(user)
    return false unless can_cancel?
    
    update!(
      state: :cancelled,
      cancelled_at: Time.current,
      cancelled_by: user
    )
  end

  private

  def generate_sale_order_number
    return if sale_order_number.present? || tenant.nil?

    # Format: SO-{tenant.subdomain.upcase}-{sequential_number}
    tenant_code = tenant.subdomain.upcase
    prefix = "SO-#{tenant_code}-"
    
    # Get all sales orders with codes for this tenant
    existing_codes = SalesOrder.where(tenant: tenant)
                               .where.not(sale_order_number: nil)
                               .where("sale_order_number LIKE ?", "#{prefix}%")
                               .pluck(:sale_order_number)
    
    # Extract numbers and find the max
    numbers = existing_codes.map do |code|
      match = code.match(/#{Regexp.escape(prefix)}(\d+)$/)
      match ? match[1].to_i : 0
    end
    
    next_number = numbers.any? ? numbers.max + 1 : 1
    self.sale_order_number = "#{prefix}#{next_number}"
  end

  def has_line_items
    if sales_order_line_items.empty?
      errors.add(:base, "Sales order must have at least one line item")
    end
  end
end

