class UserPermission < ApplicationRecord
  belongs_to :user
  belongs_to :sub_functionality

  validates :user_id, uniqueness: { scope: :sub_functionality_id, message: "already has this permission" }

  # Tenant scoped through user
  delegate :tenant, to: :user, allow_nil: true
end
