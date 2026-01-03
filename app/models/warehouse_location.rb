class WarehouseLocation < ApplicationRecord
  include TenantIsolated
  include PgSearch::Model

  acts_as_tenant :tenant

  belongs_to :tenant
  belongs_to :warehouse_location_type
  belongs_to :parent, class_name: 'WarehouseLocation', optional: true
  has_many :children, class_name: 'WarehouseLocation', foreign_key: 'parent_id', dependent: :restrict_with_error
  has_many :inventory_items, dependent: :restrict_with_error

  validates :location_code, presence: true
  validates :location_code, uniqueness: { scope: [:parent_id, :warehouse_location_type_id] }
  validates :name, presence: true
  validates :warehouse_location_type_id, presence: true
  validate :parent_level_validation

  # Full-text search using pg_search
  pg_search_scope :search_by_code_and_name,
    against: {
      location_code: 'A',
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

  scope :roots, -> { where(parent_id: nil) }
  scope :by_type, ->(type) { where(warehouse_location_type: type) }
  scope :active, -> { where(active: true) }
  scope :with_parent, ->(parent) { where(parent: parent) }
  scope :searchable, ->(query) {
    return all if query.blank?
    search_by_code_and_name(query)
  }

  def full_path
    if parent
      "#{parent.full_path}/#{location_code}"
    else
      location_code
    end
  end

  def ancestors
    result = []
    current = parent
    while current
      result.unshift(current)
      current = current.parent
    end
    result
  end

  def descendants
    result = []
    children.each do |child|
      result << child
      result.concat(child.descendants)
    end
    result
  end

  def is_leaf?
    children.empty?
  end

  def depth
    if parent
      parent.depth + 1
    else
      0
    end
  end

  private

  def parent_level_validation
    return unless parent.present? && warehouse_location_type.present?

    parent_type = parent.warehouse_location_type
    if parent_type.display_order >= warehouse_location_type.display_order
      errors.add(:parent_id, "cannot be of same or higher level in hierarchy")
    end
  end
end

