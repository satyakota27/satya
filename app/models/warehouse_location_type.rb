class WarehouseLocationType < ApplicationRecord
  include TenantIsolated

  acts_as_tenant :tenant

  belongs_to :tenant
  has_many :warehouse_locations, dependent: :restrict_with_error

  validates :name, presence: true
  validates :code, presence: true
  validates :code, uniqueness: { scope: :tenant_id }

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(:display_order, :name) }
end

