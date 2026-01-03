# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_01_02_131354) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pg_trgm"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "functionalities", force: :cascade do |t|
    t.string "name", null: false
    t.string "code", null: false
    t.text "description"
    t.boolean "active", default: true, null: false
    t.integer "display_order", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_functionalities_on_active"
    t.index ["code"], name: "index_functionalities_on_code", unique: true
    t.index ["display_order"], name: "index_functionalities_on_display_order"
  end

  create_table "inventory_items", force: :cascade do |t|
    t.bigint "material_id", null: false
    t.bigint "warehouse_location_id"
    t.bigint "tenant_id", null: false
    t.bigint "created_by_id"
    t.string "serial_number"
    t.string "batch_number"
    t.integer "quantity", default: 1
    t.string "legacy_serial_id"
    t.string "legacy_batch_number"
    t.text "notes"
    t.date "purchase_date"
    t.date "expiry_date"
    t.decimal "cost", precision: 10, scale: 2
    t.string "supplier"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_inventory_items_on_created_by_id"
    t.index ["material_id", "batch_number"], name: "index_inventory_items_on_material_and_batch", unique: true, where: "(batch_number IS NOT NULL)"
    t.index ["material_id", "serial_number"], name: "index_inventory_items_on_material_and_serial", unique: true, where: "(serial_number IS NOT NULL)"
    t.index ["material_id"], name: "index_inventory_items_on_material_id"
    t.index ["tenant_id"], name: "index_inventory_items_on_tenant_id"
    t.index ["warehouse_location_id"], name: "index_inventory_items_on_warehouse_location_id"
  end

  create_table "material_bom_components", force: :cascade do |t|
    t.bigint "material_id", null: false
    t.bigint "component_material_id", null: false
    t.integer "quantity", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["component_material_id"], name: "index_material_bom_components_on_component_material_id"
    t.index ["material_id"], name: "index_material_bom_components_on_material_id"
  end

  create_table "material_process_steps", force: :cascade do |t|
    t.bigint "material_id", null: false
    t.bigint "process_step_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["material_id", "process_step_id"], name: "idx_on_material_id_process_step_id_8d5bf3c79e", unique: true
    t.index ["material_id"], name: "index_material_process_steps_on_material_id"
    t.index ["process_step_id"], name: "index_material_process_steps_on_process_step_id"
  end

  create_table "material_quality_tests", force: :cascade do |t|
    t.bigint "material_id", null: false
    t.bigint "quality_test_id", null: false
    t.string "result_type"
    t.decimal "lower_limit", precision: 10, scale: 2
    t.decimal "upper_limit", precision: 10, scale: 2
    t.decimal "absolute_value", precision: 10, scale: 2
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["material_id", "quality_test_id"], name: "idx_on_material_id_quality_test_id_06e69f6de1", unique: true
    t.index ["material_id"], name: "index_material_quality_tests_on_material_id"
    t.index ["quality_test_id"], name: "index_material_quality_tests_on_quality_test_id"
  end

  create_table "materials", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "material_code"
    t.text "description"
    t.string "state", default: "draft", null: false
    t.bigint "procurement_unit_id"
    t.bigint "sale_unit_id"
    t.boolean "has_bom", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "approver_comments"
    t.bigint "rejected_by_id"
    t.bigint "approved_by_id"
    t.datetime "rejected_at"
    t.datetime "approved_at"
    t.boolean "has_shelf_life", default: false, null: false
    t.integer "shelf_life_years"
    t.integer "shelf_life_months"
    t.integer "shelf_life_weeks"
    t.integer "shelf_life_days"
    t.integer "shelf_life_hours"
    t.integer "shelf_life_minutes"
    t.integer "shelf_life_seconds"
    t.boolean "has_minimum_stock_value", default: false, null: false
    t.integer "minimum_stock_value"
    t.boolean "has_minimum_reorder_value", default: false, null: false
    t.integer "minimum_reorder_value"
    t.string "tracking_type"
    t.integer "sample_size"
    t.index ["approved_by_id"], name: "index_materials_on_approved_by_id"
    t.index ["material_code"], name: "index_materials_on_material_code"
    t.index ["procurement_unit_id"], name: "index_materials_on_procurement_unit_id"
    t.index ["rejected_by_id"], name: "index_materials_on_rejected_by_id"
    t.index ["sale_unit_id"], name: "index_materials_on_sale_unit_id"
    t.index ["state"], name: "index_materials_on_state"
    t.index ["tenant_id", "material_code"], name: "index_materials_on_tenant_id_and_material_code", unique: true
    t.index ["tenant_id"], name: "index_materials_on_tenant_id"
    t.index ["tracking_type"], name: "index_materials_on_tracking_type"
  end

  create_table "process_step_quality_tests", force: :cascade do |t|
    t.bigint "process_step_id", null: false
    t.bigint "quality_test_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["process_step_id", "quality_test_id"], name: "idx_on_process_step_id_quality_test_id_87dd0bfb5e", unique: true
    t.index ["process_step_id"], name: "index_process_step_quality_tests_on_process_step_id"
    t.index ["quality_test_id"], name: "index_process_step_quality_tests_on_quality_test_id"
  end

  create_table "process_steps", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "process_code"
    t.text "description", null: false
    t.integer "estimated_days"
    t.integer "estimated_hours"
    t.integer "estimated_minutes"
    t.integer "estimated_seconds"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id", "process_code"], name: "index_process_steps_on_tenant_id_and_process_code", unique: true
    t.index ["tenant_id"], name: "index_process_steps_on_tenant_id"
  end

  create_table "quality_tests", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "test_number"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "result_type"
    t.decimal "lower_limit"
    t.decimal "upper_limit"
    t.decimal "absolute_value"
    t.index ["tenant_id", "test_number"], name: "index_quality_tests_on_tenant_id_and_test_number"
    t.index ["tenant_id"], name: "index_quality_tests_on_tenant_id"
  end

  create_table "sub_functionalities", force: :cascade do |t|
    t.bigint "functionality_id", null: false
    t.string "name", null: false
    t.string "code", null: false
    t.text "description"
    t.string "screen"
    t.boolean "active", default: true, null: false
    t.integer "display_order", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_sub_functionalities_on_active"
    t.index ["display_order"], name: "index_sub_functionalities_on_display_order"
    t.index ["functionality_id", "code"], name: "index_sub_functionalities_on_functionality_id_and_code", unique: true
    t.index ["functionality_id"], name: "index_sub_functionalities_on_functionality_id"
  end

  create_table "subscriptions", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "tier"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id"], name: "index_subscriptions_on_tenant_id"
  end

  create_table "tenants", force: :cascade do |t|
    t.string "name"
    t.string "subdomain"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["subdomain"], name: "index_tenants_on_subdomain", unique: true
  end

  create_table "unit_of_measurements", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "name", null: false
    t.string "abbreviation", null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id", "name"], name: "index_unit_of_measurements_on_tenant_id_and_name", unique: true
    t.index ["tenant_id"], name: "index_unit_of_measurements_on_tenant_id"
  end

  create_table "user_permissions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "sub_functionality_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["sub_functionality_id"], name: "index_user_permissions_on_sub_functionality_id"
    t.index ["user_id", "sub_functionality_id"], name: "index_user_permissions_on_user_and_sub_functionality", unique: true
    t.index ["user_id"], name: "index_user_permissions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "role"
    t.bigint "tenant_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["tenant_id"], name: "index_users_on_tenant_id"
  end

  create_table "warehouse_location_types", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "name", null: false
    t.string "code", null: false
    t.integer "display_order", default: 0
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id", "code"], name: "index_warehouse_location_types_on_tenant_id_and_code", unique: true
    t.index ["tenant_id", "display_order"], name: "index_warehouse_location_types_on_tenant_id_and_display_order"
    t.index ["tenant_id"], name: "index_warehouse_location_types_on_tenant_id"
  end

  create_table "warehouse_locations", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.bigint "warehouse_location_type_id", null: false
    t.bigint "parent_id"
    t.string "location_code", null: false
    t.string "name", null: false
    t.text "description"
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["parent_id", "warehouse_location_type_id", "location_code"], name: "index_warehouse_locations_on_parent_type_code", unique: true
    t.index ["parent_id"], name: "index_warehouse_locations_on_parent_id"
    t.index ["tenant_id", "parent_id"], name: "index_warehouse_locations_on_tenant_id_and_parent_id"
    t.index ["tenant_id"], name: "index_warehouse_locations_on_tenant_id"
    t.index ["warehouse_location_type_id"], name: "index_warehouse_locations_on_warehouse_location_type_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "inventory_items", "materials"
  add_foreign_key "inventory_items", "tenants"
  add_foreign_key "inventory_items", "users", column: "created_by_id"
  add_foreign_key "inventory_items", "warehouse_locations"
  add_foreign_key "material_bom_components", "materials"
  add_foreign_key "material_bom_components", "materials", column: "component_material_id"
  add_foreign_key "material_process_steps", "materials"
  add_foreign_key "material_process_steps", "process_steps"
  add_foreign_key "material_quality_tests", "materials"
  add_foreign_key "material_quality_tests", "quality_tests"
  add_foreign_key "materials", "tenants"
  add_foreign_key "materials", "unit_of_measurements", column: "procurement_unit_id"
  add_foreign_key "materials", "unit_of_measurements", column: "sale_unit_id"
  add_foreign_key "process_step_quality_tests", "process_steps"
  add_foreign_key "process_step_quality_tests", "quality_tests"
  add_foreign_key "process_steps", "tenants"
  add_foreign_key "quality_tests", "tenants"
  add_foreign_key "sub_functionalities", "functionalities"
  add_foreign_key "subscriptions", "tenants"
  add_foreign_key "unit_of_measurements", "tenants"
  add_foreign_key "user_permissions", "sub_functionalities"
  add_foreign_key "user_permissions", "users"
  add_foreign_key "users", "tenants"
  add_foreign_key "warehouse_location_types", "tenants"
  add_foreign_key "warehouse_locations", "tenants"
  add_foreign_key "warehouse_locations", "warehouse_location_types"
  add_foreign_key "warehouse_locations", "warehouse_locations", column: "parent_id"
end
