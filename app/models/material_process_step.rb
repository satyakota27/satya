class MaterialProcessStep < ApplicationRecord
  belongs_to :material
  belongs_to :process_step

  validates :material_id, uniqueness: { scope: :process_step_id }
end

