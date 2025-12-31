class CreateProcessStepQualityTests < ActiveRecord::Migration[8.0]
  def change
    create_table :process_step_quality_tests do |t|
      t.references :process_step, null: false, foreign_key: true
      t.references :quality_test, null: false, foreign_key: true

      t.timestamps
    end
    
    add_index :process_step_quality_tests, [:process_step_id, :quality_test_id], unique: true
  end
end

