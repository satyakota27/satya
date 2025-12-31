class MaterialBomComponent < ApplicationRecord
  belongs_to :material
  belongs_to :component_material, class_name: 'Material'

  validates :quantity, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validate :prevent_self_reference
  validate :component_must_be_approved

  private

  def prevent_self_reference
    if material_id == component_material_id
      errors.add(:component_material_id, "cannot be the same as the material")
    end
  end

  def component_must_be_approved
    if component_material && !component_material.approved?
      errors.add(:component_material_id, "must be an approved material")
    end
  end
end

