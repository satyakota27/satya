class AddForeignKeysToMaterials < ActiveRecord::Migration[8.0]
  def change
    add_foreign_key :materials, :unit_of_measurements, column: :procurement_unit_id
    add_foreign_key :materials, :unit_of_measurements, column: :sale_unit_id
  end
end
