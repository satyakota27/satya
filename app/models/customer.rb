class Customer < ApplicationRecord
  include TenantIsolated
  include PgSearch::Model

  acts_as_tenant :tenant

  belongs_to :tenant
  has_many :sales_orders, dependent: :restrict_with_error
  has_many :customer_contacts, dependent: :destroy
  has_many :customer_shipping_addresses, dependent: :destroy

  accepts_nested_attributes_for :customer_contacts, allow_destroy: true, reject_if: proc { |attrs| attrs['name'].blank? && attrs['email'].blank? && attrs['phone'].blank? }
  accepts_nested_attributes_for :customer_shipping_addresses, allow_destroy: true, reject_if: proc { |attrs| attrs['name'].blank? && attrs['street_address'].blank? && attrs['city'].blank? }

  validates :name, presence: true
  validates :default_currency, presence: true
  validates :customer_code, uniqueness: { scope: :tenant_id }, allow_nil: true

  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }

  # Full-text search using pg_search
  pg_search_scope :search_by_code_and_name,
    against: {
      customer_code: 'A',
      name: 'B'
    },
    using: {
      tsearch: {
        prefix: true,
        any_word: true
      },
      trigram: {
        threshold: 0.3
      }
    }

  scope :searchable, ->(query) {
    return all if query.blank?
    search_by_code_and_name(query)
  }

  before_validation :generate_customer_code, on: :create

  def active?
    active
  end

  def inactive?
    !active
  end

  private

  def generate_customer_code
    return if customer_code.present? || tenant.nil?

    # Format: cust-{tenant.subdomain.downcase}-{sequential_number}
    tenant_code = tenant.subdomain.downcase
    prefix = "cust-#{tenant_code}-"
    
    # Get all customers with codes for this tenant
    existing_codes = Customer.where(tenant: tenant)
                            .where.not(customer_code: nil)
                            .where("customer_code LIKE ?", "#{prefix}%")
                            .pluck(:customer_code)
    
    # Extract numbers and find the max
    numbers = existing_codes.map do |code|
      match = code.match(/#{Regexp.escape(prefix)}(\d+)$/)
      match ? match[1].to_i : 0
    end
    
    next_number = numbers.any? ? numbers.max + 1 : 1
    self.customer_code = "#{prefix}#{next_number}"
  end
end

