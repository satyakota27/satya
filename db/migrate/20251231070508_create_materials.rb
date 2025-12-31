class CreateMaterials < ActiveRecord::Migration[8.0]
  def change
    create_table :materials do |t|
      t.references :tenant, null: false, foreign_key: true
      t.string :material_code
      t.text :description
      t.string :state, default: 'draft', null: false
      t.references :procurement_unit, null: true, foreign_key: false
      t.references :sale_unit, null: true, foreign_key: false
      t.boolean :has_bom, default: false, null: false

      t.timestamps
    end

    add_index :materials, :material_code
    add_index :materials, :state
    add_index :materials, [:tenant_id, :material_code], unique: true
  end
end
