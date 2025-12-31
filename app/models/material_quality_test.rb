class MaterialQualityTest < ApplicationRecord
  belongs_to :material
  belongs_to :quality_test
  has_many_attached :documents

  enum :result_type, { boolean: 'boolean', range: 'range', absolute: 'absolute' }

  validates :result_type, presence: true
  validates :lower_limit, presence: true, numericality: true, if: :range?
  validates :upper_limit, presence: true, numericality: true, if: :range?
  validates :absolute_value, presence: true, numericality: true, if: :absolute?
  validate :upper_limit_greater_than_lower_limit, if: :range?
  validate :document_size_limit
  validate :document_content_type

  private

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

