class CreateUnitOfMeasurements < ActiveRecord::Migration[8.0]
  def change
    create_table :unit_of_measurements do |t|
      t.references :tenant, null: false, foreign_key: true
      t.string :name, null: false
      t.string :abbreviation, null: false
      t.boolean :active, default: true, null: false

      t.timestamps
    end

    add_index :unit_of_measurements, [:tenant_id, :name], unique: true
  end
end
