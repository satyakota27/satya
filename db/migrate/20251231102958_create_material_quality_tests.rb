class CreateMaterialQualityTests < ActiveRecord::Migration[8.0]
  def change
    create_table :material_quality_tests do |t|
      t.references :material, null: false, foreign_key: true
      t.references :quality_test, null: false, foreign_key: true
      t.string :result_type
      t.decimal :lower_limit, precision: 10, scale: 2
      t.decimal :upper_limit, precision: 10, scale: 2
      t.decimal :absolute_value, precision: 10, scale: 2

      t.timestamps
    end
    
    add_index :material_quality_tests, [:material_id, :quality_test_id], unique: true
  end
end
