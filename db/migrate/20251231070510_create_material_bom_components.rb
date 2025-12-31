class CreateMaterialBomComponents < ActiveRecord::Migration[8.0]
  def change
    create_table :material_bom_components do |t|
      t.references :material, null: false, foreign_key: { to_table: :materials }
      t.references :component_material, null: false, foreign_key: { to_table: :materials }
      t.decimal :quantity, precision: 10, scale: 2, null: false

      t.timestamps
    end

  end
end
