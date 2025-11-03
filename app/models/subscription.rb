class Subscription < ApplicationRecord
  include TenantIsolated

  acts_as_tenant :tenant

  belongs_to :tenant

  enum :tier, { basic: 'basic', standard: 'standard', premium: 'premium', enterprise: 'enterprise' }

  validates :tier, presence: true
end
