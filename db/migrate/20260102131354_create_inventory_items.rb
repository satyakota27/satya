class CreateInventoryItems < ActiveRecord::Migration[8.0]
  def change
    create_table :inventory_items do |t|
      t.references :material, null: false, foreign_key: true
      t.references :warehouse_location, null: true, foreign_key: true
      t.references :tenant, null: false, foreign_key: true
      t.references :created_by, null: true, foreign_key: { to_table: :users }
      t.string :serial_number
      t.string :batch_number
      t.integer :quantity, default: 1
      t.string :legacy_serial_id
      t.string :legacy_batch_number
      t.text :notes
      t.date :purchase_date
      t.date :expiry_date
      t.decimal :cost, precision: 10, scale: 2
      t.string :supplier

      t.timestamps
    end

    add_index :inventory_items, [:material_id, :serial_number], unique: true, where: "serial_number IS NOT NULL", name: 'index_inventory_items_on_material_and_serial'
    add_index :inventory_items, [:material_id, :batch_number], unique: true, where: "batch_number IS NOT NULL", name: 'index_inventory_items_on_material_and_batch'
  end
end
