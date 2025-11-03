class Subscription < ApplicationRecord
  belongs_to :tenant

  enum :tier, { basic: 'basic', standard: 'standard', premium: 'premium', enterprise: 'enterprise' }

  validates :tier, presence: true
end
