class CreateWarehouseLocationTypes < ActiveRecord::Migration[8.0]
  def change
    create_table :warehouse_location_types do |t|
      t.references :tenant, null: false, foreign_key: true
      t.string :name, null: false
      t.string :code, null: false
      t.integer :display_order, default: 0
      t.boolean :active, default: true, null: false

      t.timestamps
    end

    add_index :warehouse_location_types, [:tenant_id, :code], unique: true
    add_index :warehouse_location_types, [:tenant_id, :display_order]
  end
end
