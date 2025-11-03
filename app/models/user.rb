class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable,
         :recoverable, :rememberable, :validatable

  acts_as_tenant :tenant, optional: true

  belongs_to :tenant, optional: true

  enum :role, { super_admin: 'super_admin', tenant_admin: 'tenant_admin', user: 'user' }

  validates :role, presence: true
  validates :email, uniqueness: true
  validate :tenant_required_for_non_super_admin

  # Rails enum automatically creates super_admin? and tenant_admin? methods

  private

  def tenant_required_for_non_super_admin
    return if super_admin? || tenant_id.present?

    errors.add(:tenant_id, 'is required for non-super-admin users')
  end
end
