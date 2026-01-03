class CreateWarehouseLocations < ActiveRecord::Migration[8.0]
  def change
    create_table :warehouse_locations do |t|
      t.references :tenant, null: false, foreign_key: true
      t.references :warehouse_location_type, null: false, foreign_key: true
      t.references :parent, null: true, foreign_key: { to_table: :warehouse_locations }
      t.string :location_code, null: false
      t.string :name, null: false
      t.text :description
      t.boolean :active, default: true, null: false

      t.timestamps
    end

    add_index :warehouse_locations, [:parent_id, :warehouse_location_type_id, :location_code], unique: true, name: 'index_warehouse_locations_on_parent_type_code'
    add_index :warehouse_locations, [:tenant_id, :parent_id]
  end
end
