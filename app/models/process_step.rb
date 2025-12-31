class ProcessStep < ApplicationRecord
  include TenantIsolated
  include PgSearch::Model

  acts_as_tenant :tenant

  belongs_to :tenant
  has_many :material_process_steps, dependent: :destroy
  has_many :materials, through: :material_process_steps
  has_many :process_step_quality_tests, dependent: :destroy
  has_many :quality_tests, through: :process_step_quality_tests
  has_many_attached :documents

  validates :process_code, presence: true, uniqueness: { scope: :tenant_id }
  validates :description, presence: true
  validate :document_size_limit
  validate :document_content_type

  before_validation :generate_process_code, on: :create

  # Full-text search using pg_search
  pg_search_scope :search_by_code_and_description,
    against: {
      process_code: 'A',
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
    search_by_code_and_description(query)
  }

  private

  def generate_process_code
    return if process_code.present? || tenant.nil?

    # Format: PS-{tenant.subdomain.upcase}-{sequential_number}
    tenant_code = tenant.subdomain.upcase
    prefix = "PS-#{tenant_code}-"
    
    # Get all process steps with codes for this tenant
    existing_codes = ProcessStep.where(tenant: tenant)
                              .where.not(process_code: nil)
                              .where("process_code LIKE ?", "#{prefix}%")
                              .pluck(:process_code)
    
    # Extract numbers and find the max
    numbers = existing_codes.map do |code|
      match = code.match(/#{Regexp.escape(prefix)}(\d+)$/)
      match ? match[1].to_i : 0
    end
    
    next_number = numbers.any? ? numbers.max + 1 : 1
    self.process_code = "#{prefix}#{next_number}"
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

