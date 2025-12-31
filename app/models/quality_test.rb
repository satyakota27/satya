class QualityTest < ApplicationRecord
  include TenantIsolated
  include PgSearch::Model

  acts_as_tenant :tenant

  belongs_to :tenant
  has_many :material_quality_tests, dependent: :destroy
  has_many :materials, through: :material_quality_tests
  has_many_attached :documents

  # Explicitly declare attribute type for enum
  attribute :result_type, :string
  enum :result_type, { boolean: 'boolean', range: 'range', absolute: 'absolute' }

  validates :test_number, presence: true, uniqueness: { scope: :tenant_id }
  validates :description, presence: true
  validates :result_type, presence: true
  validates :lower_limit, presence: true, numericality: true, if: :range?
  validates :upper_limit, presence: true, numericality: true, if: :range?
  validates :absolute_value, presence: true, numericality: true, if: :absolute?
  validate :upper_limit_greater_than_lower_limit, if: :range?
  validate :document_size_limit
  validate :document_content_type

  before_validation :generate_test_number, on: :create

  # Full-text search using pg_search
  pg_search_scope :search_by_test_number_and_description,
    against: {
      test_number: 'A',
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

  scope :searchable, ->(query) {
    return all if query.blank?
    search_by_test_number_and_description(query)
  }

  private

  def generate_test_number
    return if test_number.present? || tenant.nil?

    # Format: QT-{tenant.subdomain.upcase}-{sequential_number}
    tenant_code = tenant.subdomain.upcase
    prefix = "QT-#{tenant_code}-"
    
    # Get all quality tests with codes for this tenant
    existing_codes = QualityTest.where(tenant: tenant)
                                .where.not(test_number: nil)
                                .where("test_number LIKE ?", "#{prefix}%")
                                .pluck(:test_number)
    
    # Extract numbers and find the max
    numbers = existing_codes.map do |code|
      match = code.match(/#{Regexp.escape(prefix)}(\d+)$/)
      match ? match[1].to_i : 0
    end
    
    next_number = numbers.any? ? numbers.max + 1 : 1
    self.test_number = "#{prefix}#{next_number}"
  end

  def upper_limit_greater_than_lower_limit
    if lower_limit.present? && upper_limit.present? && upper_limit <= lower_limit
      errors.add(:upper_limit, "must be greater than lower limit")
    end
  end

  def document_size_limit
    documents.each do |document|
      if document.byte_size > 5.megabytes
        errors.add(:documents, "#{document.filename} is too large (max 5MB)")
      end
    end
  end

  def document_content_type
    allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
    documents.each do |document|
      unless allowed_types.include?(document.content_type)
        errors.add(:documents, "#{document.filename} must be a PDF or image file")
      end
    end
  end
end
