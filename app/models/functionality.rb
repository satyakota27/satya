class Functionality < ApplicationRecord
  has_many :sub_functionalities, dependent: :destroy
  has_many :user_permissions, through: :sub_functionalities

  validates :name, presence: true
  validates :code, presence: true, uniqueness: true
  validates :active, inclusion: { in: [true, false] }

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(display_order: :asc, name: :asc) }
end
