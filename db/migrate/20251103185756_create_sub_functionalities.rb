class CreateSubFunctionalities < ActiveRecord::Migration[8.0]
  def change
    create_table :sub_functionalities do |t|
      t.references :functionality, null: false, foreign_key: true
      t.string :name, null: false
      t.string :code, null: false
      t.text :description
      t.string :screen
      t.boolean :active, default: true, null: false
      t.integer :display_order, default: 0

      t.timestamps
    end

    add_index :sub_functionalities, [:functionality_id, :code], unique: true
    add_index :sub_functionalities, :active
    add_index :sub_functionalities, :display_order
  end
end
