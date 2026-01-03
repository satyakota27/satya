class SalesOrderLineItem < ApplicationRecord
  belongs_to :sales_order
  belongs_to :material

  validates :quantity, presence: true, numericality: { greater_than: 0, only_integer: true }
  validates :unit_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :dispatch_date, presence: true
  validates :dispatched_quantity, numericality: { greater_than_or_equal_to: 0, only_integer: true }
  validate :dispatched_quantity_not_exceed_quantity
  validate :dispatch_date_not_in_past_for_confirmed_orders

  before_save :calculate_line_total
  before_save :set_basic_value

  def calculate_line_total
    # Calculate basic value (quantity * unit_price)
    base_amount = quantity * unit_price
    
    # Calculate discount amount
    if discount_percentage.present? && discount_percentage > 0
      self.discount_amount = (base_amount * discount_percentage / 100.0).round(2)
    else
      self.discount_amount = 0.0
    end
    
    # Calculate amount after discount
    amount_after_discount = base_amount - discount_amount
    
    # Calculate tax amount
    if tax_percentage.present? && tax_percentage > 0
      self.tax_amount = (amount_after_discount * tax_percentage / 100.0).round(2)
    else
      self.tax_amount = 0.0
    end
    
    # Line total = base_amount - discount + tax
    self.line_total = (amount_after_discount + tax_amount).round(2)
  end

  def set_basic_value
    self.basic_value = (quantity * unit_price).round(2)
  end

  def remaining_quantity
    quantity - dispatched_quantity
  end

  def fully_dispatched?
    dispatched_quantity >= quantity
  end

  def partially_dispatched?
    dispatched_quantity > 0 && dispatched_quantity < quantity
  end

  def not_dispatched?
    dispatched_quantity == 0
  end

  private

  def dispatched_quantity_not_exceed_quantity
    if dispatched_quantity.present? && quantity.present? && dispatched_quantity > quantity
      errors.add(:dispatched_quantity, "cannot exceed ordered quantity")
    end
  end

  def dispatch_date_not_in_past_for_confirmed_orders
    if dispatch_date.present? && sales_order.present? && sales_order.confirmed?
      if dispatch_date < Date.today
        errors.add(:dispatch_date, "cannot be in the past for confirmed orders")
      end
    end
  end
end

