class AddResultTypeToQualityTests < ActiveRecord::Migration[8.0]
  def change
    add_column :quality_tests, :result_type, :string
    add_column :quality_tests, :lower_limit, :decimal, precision: 10, scale: 2
    add_column :quality_tests, :upper_limit, :decimal, precision: 10, scale: 2
    add_column :quality_tests, :absolute_value, :decimal, precision: 10, scale: 2
  end
end
