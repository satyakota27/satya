class Material < ApplicationRecord
  include TenantIsolated
  include PgSearch::Model

  acts_as_tenant :tenant

  belongs_to :tenant
  belongs_to :procurement_unit, class_name: 'UnitOfMeasurement', optional: true
  belongs_to :sale_unit, class_name: 'UnitOfMeasurement', optional: true
  belongs_to :rejected_by, class_name: 'User', optional: true
  belongs_to :approved_by, class_name: 'User', optional: true
  has_many :material_bom_components, dependent: :destroy
  has_many :bom_components, through: :material_bom_components, source: :component_material

  enum :state, { draft: 'draft', rejected: 'rejected', approved: 'approved' }
  
  # Explicitly declare attribute type for enum
  attribute :tracking_type, :string
  enum :tracking_type, { unit: 'unit', batch: 'batch' }

  validates :description, presence: true
  validates :tracking_type, presence: true
  validates :procurement_unit_id, presence: true, if: :approved?
  validates :sale_unit_id, presence: true, if: :approved?
  validates :material_code, uniqueness: { scope: :tenant_id }, allow_nil: true
  validates :sample_size, presence: true, numericality: { greater_than: 0, only_integer: true }, if: :batch?
  validate :shelf_life_present_if_enabled, if: :has_shelf_life?
  validates :minimum_stock_value, presence: true, numericality: { greater_than: 0, only_integer: true }, if: :has_minimum_stock_value?
  validates :minimum_reorder_value, presence: true, numericality: { greater_than: 0, only_integer: true }, if: :has_minimum_reorder_value?

  # Full-text search using pg_search
  pg_search_scope :search_by_code_and_description,
    against: {
      material_code: 'A',
      description: 'B'
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

  scope :by_state, ->(state) { where(state: state) if state.present? }
  scope :searchable, ->(query) {
    return all if query.blank?
    search_by_code_and_description(query)
  }
  
  def rejected?
    state == 'rejected'
  end
  
  def can_be_updated_by_creator?
    draft? || rejected?
  end

  before_save :generate_material_code, if: :should_generate_code?
  before_save :clear_shelf_life_if_disabled
  before_save :clear_stock_values_if_disabled
  before_save :clear_sample_size_if_not_batch

  def generate_material_code
    return if material_code.present? || tenant.nil?

    # Format: M-{tenant.subdomain.upcase}-{sequential_number}
    tenant_code = tenant.subdomain.upcase
    prefix = "M-#{tenant_code}-"
    
    # Get all materials with codes for this tenant
    existing_codes = Material.where(tenant: tenant)
                             .where.not(material_code: nil)
                             .where("material_code LIKE ?", "#{prefix}%")
                             .pluck(:material_code)
    
    # Extract numbers and find the max
    numbers = existing_codes.map do |code|
      match = code.match(/#{Regexp.escape(prefix)}(\d+)$/)
      match ? match[1].to_i : 0
    end
    
    next_number = numbers.any? ? numbers.max + 1 : 1
    self.material_code = "#{prefix}#{next_number}"
  end

  private

  def should_generate_code?
    state_changed? && approved? && material_code.blank?
  end

  def clear_shelf_life_if_disabled
    unless has_shelf_life?
      self.shelf_life_years = nil
      self.shelf_life_months = nil
      self.shelf_life_weeks = nil
      self.shelf_life_days = nil
      self.shelf_life_hours = nil
      self.shelf_life_minutes = nil
      self.shelf_life_seconds = nil
    end
  end

  def shelf_life_present_if_enabled
    if has_shelf_life? && shelf_life_years.to_i == 0 && shelf_life_months.to_i == 0 && 
       shelf_life_weeks.to_i == 0 && shelf_life_days.to_i == 0 && 
       shelf_life_hours.to_i == 0 && shelf_life_minutes.to_i == 0 && shelf_life_seconds.to_i == 0
      errors.add(:base, "At least one shelf life value must be specified when shelf life is enabled")
    end
  end

  def clear_stock_values_if_disabled
    self.minimum_stock_value = nil unless has_minimum_stock_value?
    self.minimum_reorder_value = nil unless has_minimum_reorder_value?
  end

  def clear_sample_size_if_not_batch
    self.sample_size = nil unless batch?
  end
end

