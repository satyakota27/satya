class Material < ApplicationRecord
  include TenantIsolated
  include PgSearch::Model

  acts_as_tenant :tenant

  belongs_to :tenant
  belongs_to :procurement_unit, class_name: 'UnitOfMeasurement', optional: true
  belongs_to :sale_unit, class_name: 'UnitOfMeasurement', optional: true
  has_many :material_bom_components, dependent: :destroy
  has_many :bom_components, through: :material_bom_components, source: :component_material

  enum :state, { draft: 'draft', approved: 'approved' }

  validates :description, presence: true
  validates :procurement_unit_id, presence: true, if: :approved?
  validates :sale_unit_id, presence: true, if: :approved?
  validates :material_code, uniqueness: { scope: :tenant_id }, allow_nil: true

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

  before_save :generate_material_code, if: :should_generate_code?

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
end

