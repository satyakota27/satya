class UnitOfMeasurement < ApplicationRecord
  include TenantIsolated

  acts_as_tenant :tenant

  belongs_to :tenant

  validates :name, presence: true
  validates :abbreviation, presence: true
  validates :name, uniqueness: { scope: :tenant_id, message: "must be unique within tenant" }

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(:name) }

  def display_name
    "#{name} (#{abbreviation})"
  end
end

