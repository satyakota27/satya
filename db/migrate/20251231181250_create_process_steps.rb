class CreateProcessSteps < ActiveRecord::Migration[8.0]
  def change
    create_table :process_steps do |t|
      t.references :tenant, null: false, foreign_key: true
      t.string :process_code
      t.text :description, null: false
      t.integer :estimated_days
      t.integer :estimated_hours
      t.integer :estimated_minutes
      t.integer :estimated_seconds

      t.timestamps
    end
    
    add_index :process_steps, [:tenant_id, :process_code], unique: true
  end
end

