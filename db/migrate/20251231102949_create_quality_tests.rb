class CreateQualityTests < ActiveRecord::Migration[8.0]
  def change
    create_table :quality_tests do |t|
      t.references :tenant, null: false, foreign_key: true
      t.string :test_number
      t.text :description

      t.timestamps
    end
    
    add_index :quality_tests, [:tenant_id, :test_number]
  end
end
