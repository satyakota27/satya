class CreateMaterialProcessSteps < ActiveRecord::Migration[8.0]
  def change
    create_table :material_process_steps do |t|
      t.references :material, null: false, foreign_key: true
      t.references :process_step, null: false, foreign_key: true

      t.timestamps
    end
    
    add_index :material_process_steps, [:material_id, :process_step_id], unique: true
  end
end

