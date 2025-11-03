class Tenant < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :subscriptions, dependent: :destroy

  validates :name, presence: true
  validates :subdomain, presence: true, uniqueness: true

  has_one :current_subscription, -> { order(created_at: :desc) }, class_name: 'Subscription'
end
