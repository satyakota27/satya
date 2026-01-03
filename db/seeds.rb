# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create Super Admins
puts "Creating super admins..."

super_admin1 = User.find_or_create_by!(email: 'admin1@example.com') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.role = 'super_admin'
  user.tenant = nil
end

super_admin2 = User.find_or_create_by!(email: 'admin2@example.com') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.role = 'super_admin'
  user.tenant = nil
end

puts "Super admins created:"
puts "  - #{super_admin1.email} (password: password123)"
puts "  - #{super_admin2.email} (password: password123)"

# Create sample tenants with subscriptions
puts "\nCreating sample tenants..."

tenant1 = Tenant.find_or_create_by!(subdomain: 'acme') do |tenant|
  tenant.name = 'Acme Corporation'
end

tenant2 = Tenant.find_or_create_by!(subdomain: 'widgets') do |tenant|
  tenant.name = 'Widgets Inc'
end

puts "Tenants created:"
puts "  - #{tenant1.name} (#{tenant1.subdomain})"
puts "  - #{tenant2.name} (#{tenant2.subdomain})"

# Create subscriptions for tenants
puts "\nCreating subscriptions..."

Subscription.find_or_create_by!(tenant: tenant1) do |subscription|
  subscription.tier = :premium
end

Subscription.find_or_create_by!(tenant: tenant2) do |subscription|
  subscription.tier = :standard
end

puts "Subscriptions created"

# Create tenant admin for tenant1
puts "\nCreating tenant admins..."

tenant_admin1 = User.find_or_create_by!(email: 'admin@acme.com') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.role = 'tenant_admin'
  user.tenant = tenant1
end

puts "Tenant admin created: #{tenant_admin1.email} (password: password123)"

# Create regular users
puts "\nCreating regular users..."

User.find_or_create_by!(email: 'user1@acme.com') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.role = 'user'
  user.tenant = tenant1
end

User.find_or_create_by!(email: 'user2@acme.com') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.role = 'user'
  user.tenant = tenant1
end

User.find_or_create_by!(email: 'user1@widgets.com') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.role = 'user'
  user.tenant = tenant2
end

puts "Regular users created"

# Create Functionalities and Sub-Functionalities
puts "\nCreating functionalities and sub-functionalities..."

# Material Management
material_mgmt = Functionality.find_or_create_by!(code: 'material_management') do |f|
  f.name = 'Material Management'
  f.display_order = 1
  f.active = true
end

# Keep existing sub-functionalities for backward compatibility
SubFunctionality.find_or_create_by!(functionality: material_mgmt, code: 'create_material') do |sf|
  sf.name = 'create material'
  sf.screen = 'create material screen'
  sf.display_order = 1
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: material_mgmt, code: 'enable_disable_material') do |sf|
  sf.name = 'enable/disable material'
  sf.screen = 'manage material screen'
  sf.display_order = 2
  sf.active = true
end

# New sub-functionalities as per plan
SubFunctionality.find_or_create_by!(functionality: material_mgmt, code: 'material_approver') do |sf|
  sf.name = 'Material Approver'
  sf.screen = 'approve material screen'
  sf.display_order = 3
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: material_mgmt, code: 'material_listing') do |sf|
  sf.name = 'Material Listing'
  sf.screen = 'material listing screen'
  sf.display_order = 4
  sf.active = true
end

# User Management
user_mgmt = Functionality.find_or_create_by!(code: 'user_management') do |f|
  f.name = 'User Management'
  f.display_order = 2
  f.active = true
end

SubFunctionality.find_or_create_by!(functionality: user_mgmt, code: 'create_user') do |sf|
  sf.name = 'create user'
  sf.screen = 'create user screen'
  sf.display_order = 1
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: user_mgmt, code: 'enable_disable_user') do |sf|
  sf.name = 'enable/disable user, assign functions, assign approval hierarchy'
  sf.screen = 'manage user screen'
  sf.display_order = 2
  sf.active = true
end

# Supply chain management
supply_chain = Functionality.find_or_create_by!(code: 'supply_chain_management') do |f|
  f.name = 'Supply chain management'
  f.display_order = 3
  f.active = true
end

SubFunctionality.find_or_create_by!(functionality: supply_chain, code: 'create_vendor') do |sf|
  sf.name = 'create vendor'
  sf.screen = 'create vendor screen'
  sf.display_order = 1
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: supply_chain, code: 'enable_disable_vendor') do |sf|
  sf.name = 'enable/disable vendor'
  sf.screen = 'manage vendor screen'
  sf.display_order = 2
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: supply_chain, code: 'purchase_analysis') do |sf|
  sf.name = 'Purchase analysis'
  sf.screen = 'Purchase analysis screen'
  sf.display_order = 3
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: supply_chain, code: 'create_po') do |sf|
  sf.name = 'Create P.O'
  sf.screen = 'create P.O. screen'
  sf.display_order = 4
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: supply_chain, code: 'manage_po') do |sf|
  sf.name = 'Cancel P.O. / Edit P.O. / Reopen P.O.'
  sf.screen = 'Manage P.O. screen'
  sf.display_order = 5
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: supply_chain, code: 'material_commercials') do |sf|
  sf.name = 'Material - commercials management'
  sf.screen = 'Material - commercials screen'
  sf.display_order = 6
  sf.active = true
end

# Store management
store_mgmt = Functionality.find_or_create_by!(code: 'store_management') do |f|
  f.name = 'Store management'
  f.display_order = 4
  f.active = true
end

SubFunctionality.find_or_create_by!(functionality: store_mgmt, code: 'raise_grn') do |sf|
  sf.name = 'Raise GRN'
  sf.screen = 'Create GRN screen'
  sf.display_order = 1
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: store_mgmt, code: 'create_warehouse') do |sf|
  sf.name = 'Create warehouse'
  sf.screen = 'Create warehouse screen'
  sf.display_order = 2
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: store_mgmt, code: 'enable_disable_warehouse') do |sf|
  sf.name = 'Enable/Disable warehouse'
  sf.screen = 'manage warehouse screen'
  sf.display_order = 3
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: store_mgmt, code: 'manage_inventory') do |sf|
  sf.name = 'Manage inventory'
  sf.screen = 'Inventory management screen'
  sf.display_order = 4
  sf.active = true
end

# Master tables management
master_tables = Functionality.find_or_create_by!(code: 'master_tables_management') do |f|
  f.name = 'Master tables management'
  f.display_order = 5
  f.active = true
end

SubFunctionality.find_or_create_by!(functionality: master_tables, code: 'manage_uom') do |sf|
  sf.name = 'Manage UOM master'
  sf.screen = 'UOM master screen'
  sf.display_order = 1
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: master_tables, code: 'manage_saqc') do |sf|
  sf.name = 'Manage SAQC master'
  sf.screen = 'Store acceptance quality checks master screen'
  sf.display_order = 2
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: master_tables, code: 'manage_ps') do |sf|
  sf.name = 'Manage PS master'
  sf.screen = 'Process steps master screen'
  sf.display_order = 3
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: master_tables, code: 'manage_psqc') do |sf|
  sf.name = 'Manage PSQC master'
  sf.screen = 'Process steps QC test master screen'
  sf.display_order = 4
  sf.active = true
end

# Production management
production_mgmt = Functionality.find_or_create_by!(code: 'production_management') do |f|
  f.name = 'Production management'
  f.display_order = 6
  f.active = true
end

SubFunctionality.find_or_create_by!(functionality: production_mgmt, code: 'create_workstation') do |sf|
  sf.name = 'create workstation'
  sf.screen = 'create workstation screen'
  sf.display_order = 1
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: production_mgmt, code: 'enable_disable_workstation') do |sf|
  sf.name = 'enable/disable workstation'
  sf.screen = 'manage workstation screen'
  sf.display_order = 2
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: production_mgmt, code: 'job_queue_management') do |sf|
  sf.name = 'Job queue management'
  sf.screen = 'Job queue management screen'
  sf.display_order = 3
  sf.active = true
end

# Job work management
job_work = Functionality.find_or_create_by!(code: 'job_work_management') do |f|
  f.name = 'Job work management'
  f.display_order = 7
  f.active = true
end

SubFunctionality.find_or_create_by!(functionality: job_work, code: 'create_job_work_po') do |sf|
  sf.name = 'Create Job work P.O.'
  sf.screen = 'Create job work P.O. screen'
  sf.display_order = 1
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: job_work, code: 'manage_job_work_po') do |sf|
  sf.name = 'Edit / Cancel / Reopen Job work P.O.'
  sf.screen = 'Manage Job work P.O. screen'
  sf.display_order = 2
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: job_work, code: 'move_material_to_job_work_vendor') do |sf|
  sf.name = 'Move material to job work vendor'
  sf.screen = 'MMD screen'
  sf.display_order = 3
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: job_work, code: 'receive_material_from_job_work_vendor') do |sf|
  sf.name = 'Receive material from job work vendor'
  sf.screen = 'create GRN screen'
  sf.display_order = 4
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: job_work, code: 'track_inventory_with_job_work_vendor') do |sf|
  sf.name = 'Track inventory with job work vendor'
  sf.screen = 'Track inventory screen'
  sf.display_order = 5
  sf.active = true
end

# Quality Control
quality_control = Functionality.find_or_create_by!(code: 'quality_control') do |f|
  f.name = 'Quality Control'
  f.display_order = 8
  f.active = true
end

SubFunctionality.find_or_create_by!(functionality: quality_control, code: 'store_acceptance_qc') do |sf|
  sf.name = 'Store acceptance quality control'
  sf.screen = 'QC screen'
  sf.display_order = 1
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: quality_control, code: 'process_acceptance_qc') do |sf|
  sf.name = 'Process acceptance quality control'
  sf.screen = 'QC screen'
  sf.display_order = 2
  sf.active = true
end

# Special functions
special_functions = Functionality.find_or_create_by!(code: 'special_functions') do |f|
  f.name = 'Special functions'
  f.display_order = 9
  f.active = true
end

SubFunctionality.find_or_create_by!(functionality: special_functions, code: 'rejection_inventory_management') do |sf|
  sf.name = 'Rejection inventory management'
  sf.screen = 'Rejection inventory management screen'
  sf.display_order = 1
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: special_functions, code: 'track_material') do |sf|
  sf.name = 'Track material'
  sf.screen = 'Track material screen'
  sf.display_order = 2
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: special_functions, code: 'move_rejection_material_to_vendor') do |sf|
  sf.name = 'Move rejection material to Vendor'
  sf.screen = 'MMD screen'
  sf.display_order = 3
  sf.active = true
end

# Accounts
accounts = Functionality.find_or_create_by!(code: 'accounts') do |f|
  f.name = 'Accounts'
  f.display_order = 10
  f.active = true
end

SubFunctionality.find_or_create_by!(functionality: accounts, code: 'clear_invoice') do |sf|
  sf.name = 'Clear Invoice'
  sf.screen = 'Invoice status screen'
  sf.display_order = 1
  sf.active = true
end

SubFunctionality.find_or_create_by!(functionality: accounts, code: 'track_payables') do |sf|
  sf.name = 'Track payables'
  sf.screen = 'Track payables screen'
  sf.display_order = 2
  sf.active = true
end

puts "Functionalities and sub-functionalities created successfully!"

puts "\nSeed data created successfully!"

# Load additional seed files
Dir[File.join(__dir__, 'seeds', '*.rb')].sort.each do |seed_file|
  puts "\n" + "="*50
  load seed_file
end

puts "\n" + "="*50
puts "\nSeed data created successfully!"
puts "\nYou can now login with:"
puts "  Super Admin: admin1@example.com / password123"
puts "  Super Admin: admin2@example.com / password123"
puts "  Tenant Admin: admin@acme.com / password123"
puts "  Regular User: user1@acme.com / password123"
