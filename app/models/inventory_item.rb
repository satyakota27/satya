class InventoryItem < ApplicationRecord
  include TenantIsolated

  acts_as_tenant :tenant

  belongs_to :material
  belongs_to :warehouse_location, optional: true
  belongs_to :tenant
  belongs_to :created_by, class_name: 'User', optional: true

  validates :material_id, presence: true
  validates :quantity, presence: true, numericality: { greater_than: 0, only_integer: true }
  validates :serial_number, uniqueness: { scope: :material_id }, allow_nil: true
  validates :batch_number, uniqueness: { scope: :material_id }, allow_nil: true
  validate :material_must_be_approved

  scope :by_material, ->(material) { where(material: material) }
  scope :by_location, ->(location) { where(warehouse_location: location) }
  scope :by_warehouse_location, ->(location) { where(warehouse_location: location) }
  scope :with_serial, -> { where.not(serial_number: nil) }
  scope :with_batch, -> { where.not(batch_number: nil) }

  before_validation :set_default_quantity
  before_validation :generate_serial_or_batch_number, if: -> { material.present? && tenant.present? }

  private

  def material_must_be_approved
    return unless material.present?

    unless material.approved?
      errors.add(:material_id, "must be approved before adding inventory")
    end
  end

  def set_default_quantity
    self.quantity = 1 if quantity.nil? && material&.unit?
  end

  def generate_serial_or_batch_number
    return unless material.present? && tenant.present?
    
    tenant_code = tenant.subdomain.upcase
    prefix = "INV-#{tenant_code}-"
    
    if material.unit?
      # Generate serial number for unit-tracking materials
      return if serial_number.present? # Don't overwrite if already set
      
      # Find max sequence number for serial numbers
      existing_numbers = InventoryItem.where(tenant: tenant)
                                      .where("serial_number LIKE ?", "#{prefix}%")
                                      .where.not(id: id || 0) # Exclude current record if updating
                                      .pluck(:serial_number)
      
      # Extract numbers and find max
      max_number = existing_numbers.map do |num|
        match = num.match(/#{Regexp.escape(prefix)}(\d+)$/)
        match ? match[1].to_i : 0
      end.max || 0
      
      next_number = max_number + 1
      self.serial_number = "#{prefix}#{next_number}"
    elsif material.batch?
      # Generate batch number for batch-tracking materials
      return if batch_number.present? # Don't overwrite if already set
      
      # Find max sequence number for batch numbers
      existing_numbers = InventoryItem.where(tenant: tenant)
                                      .where("batch_number LIKE ?", "#{prefix}%")
                                      .where.not(id: id || 0) # Exclude current record if updating
                                      .pluck(:batch_number)
      
      # Extract numbers and find max
      max_number = existing_numbers.map do |num|
        match = num.match(/#{Regexp.escape(prefix)}(\d+)$/)
        match ? match[1].to_i : 0
      end.max || 0
      
      next_number = max_number + 1
      self.batch_number = "#{prefix}#{next_number}"
    end
  end
end

