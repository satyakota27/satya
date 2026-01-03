class CustomerShippingAddress < ApplicationRecord
  belongs_to :customer

  validates :name, presence: true

  scope :default, -> { where(is_default: true) }
  scope :ordered, -> { order(is_default: :desc, created_at: :asc) }

  before_save :ensure_single_default

  def full_address
    parts = [street_address, city, state, postal_code, country].compact.reject(&:blank?)
    parts.join(', ')
  end

  private

  def ensure_single_default
    if is_default? && is_default_changed?
      customer.customer_shipping_addresses.where.not(id: id).update_all(is_default: false)
    end
  end
end

