class CreateFunctionalities < ActiveRecord::Migration[8.0]
  def change
    create_table :functionalities do |t|
      t.string :name, null: false
      t.string :code, null: false
      t.text :description
      t.boolean :active, default: true, null: false
      t.integer :display_order, default: 0

      t.timestamps
    end

    add_index :functionalities, :code, unique: true
    add_index :functionalities, :active
    add_index :functionalities, :display_order
  end
end
