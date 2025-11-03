class SubFunctionality < ApplicationRecord
  belongs_to :functionality
  has_many :user_permissions, dependent: :destroy
  has_many :users, through: :user_permissions

  validates :name, presence: true
  validates :code, presence: true
  validates :code, uniqueness: { scope: :functionality_id, message: "must be unique within functionality" }
  validates :active, inclusion: { in: [true, false] }

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(display_order: :asc, name: :asc) }

  # Full code combining functionality code and sub-functionality code
  def full_code
    "#{functionality.code}.#{code}"
  end
end
