require 'faker'

puts "\n=== Seeding Inventory Items ==="

# Get tenant and required data
tenant = Tenant.find_by(subdomain: 'acme') || Tenant.first
user = User.find_by(email: 'user2@acme.com') || User.where(tenant: tenant, role: 'user').first

unless tenant
  puts "ERROR: No tenant found. Please run main seeds first."
  exit
end

# Get approved materials
approved_materials = Material.where(tenant: tenant, state: 'approved')
if approved_materials.empty?
  puts "ERROR: No approved materials found. Please create and approve materials first."
  exit
end

# Create some warehouse locations if they don't exist
location_types = WarehouseLocationType.where(tenant: tenant).active.ordered
if location_types.empty?
  puts "Creating warehouse location types..."
  
  # Create default location types
  location_types = [
    { name: 'Geographic Location', code: 'geo_location', display_order: 1 },
    { name: 'Building', code: 'building', display_order: 2 },
    { name: 'Zone', code: 'zone', display_order: 3 },
    { name: 'Rack', code: 'rack', display_order: 4 },
    { name: 'Row', code: 'row', display_order: 5 },
    { name: 'Bin', code: 'bin', display_order: 6 }
  ]
  
  location_types.each do |lt_data|
    WarehouseLocationType.find_or_create_by!(tenant: tenant, code: lt_data[:code]) do |lt|
      lt.name = lt_data[:name]
      lt.display_order = lt_data[:display_order]
      lt.active = true
    end
  end
  
  location_types = WarehouseLocationType.where(tenant: tenant).active.ordered
end

# Create root locations if they don't exist
geo_type = location_types.find_by(code: 'geo_location')
building_type = location_types.find_by(code: 'building')
zone_type = location_types.find_by(code: 'zone')

if geo_type && WarehouseLocation.where(tenant: tenant, warehouse_location_type: geo_type).empty?
  puts "Creating warehouse locations..."
  
  # Create geographic locations
  locations = [
    { code: 'USA', name: 'United States', type: geo_type, parent: nil },
    { code: 'IND', name: 'India', type: geo_type, parent: nil },
    { code: 'UK', name: 'United Kingdom', type: geo_type, parent: nil }
  ]
  
  geo_locations = {}
  locations.each do |loc_data|
    loc = WarehouseLocation.find_or_create_by!(
      tenant: tenant,
      warehouse_location_type: loc_data[:type],
      location_code: loc_data[:code],
      parent_id: loc_data[:parent]&.id
    ) do |l|
      l.name = loc_data[:name]
      l.active = true
    end
    geo_locations[loc_data[:code]] = loc
  end
  
  # Create buildings
  if building_type
    buildings = [
      { code: 'BLD1', name: 'Building 1', type: building_type, parent: geo_locations['USA'] },
      { code: 'BLD2', name: 'Building 2', type: building_type, parent: geo_locations['USA'] },
      { code: 'BLD3', name: 'Main Building', type: building_type, parent: geo_locations['IND'] }
    ]
    
    building_locations = {}
    buildings.each do |bld_data|
      bld = WarehouseLocation.find_or_create_by!(
        tenant: tenant,
        warehouse_location_type: bld_data[:type],
        location_code: bld_data[:code],
        parent_id: bld_data[:parent]&.id
      ) do |l|
        l.name = bld_data[:name]
        l.active = true
      end
      building_locations[bld_data[:code]] = bld
    end
    
    # Create zones
    if zone_type && building_locations.any?
      zones = [
        { code: 'ZONE-A', name: 'Zone A', type: zone_type, parent: building_locations['BLD1'] },
        { code: 'ZONE-B', name: 'Zone B', type: zone_type, parent: building_locations['BLD1'] },
        { code: 'ZONE-1', name: 'Zone 1', type: zone_type, parent: building_locations['BLD2'] }
      ]
      
      zones.each do |zone_data|
        WarehouseLocation.find_or_create_by!(
          tenant: tenant,
          warehouse_location_type: zone_data[:type],
          location_code: zone_data[:code],
          parent_id: zone_data[:parent]&.id
        ) do |l|
          l.name = zone_data[:name]
          l.active = true
        end
      end
    end
  end
end

# Delete all existing inventory items for this tenant
existing_count = InventoryItem.where(tenant: tenant).count
if existing_count > 0
  puts "Removing #{existing_count} existing inventory items..."
  InventoryItem.where(tenant: tenant).destroy_all
  puts "  ✓ Removed all existing inventory items"
end

# Get available warehouse locations
warehouse_locations = WarehouseLocation.where(tenant: tenant).active
puts "Using #{warehouse_locations.count} warehouse locations"

# Create inventory items
20.times do |i|
  material = approved_materials.sample
  
  # Determine if we should create inventory for this material
  next if material.nil?
  
  # Set quantity based on tracking type
  quantity = material.unit? ? 1 : rand(10..100)
  
  # Randomly assign warehouse location (70% chance)
  warehouse_location = rand < 0.7 ? warehouse_locations.sample : nil
  
  # Create legacy data (50% chance)
  legacy_serial_id = material.unit? && rand < 0.5 ? "LEGACY-#{rand(1000..9999)}" : nil
  legacy_batch_number = material.batch? && rand < 0.5 ? "OLD-BATCH-#{rand(100..999)}" : nil
  
  inventory_item = InventoryItem.new(
    tenant: tenant,
    material: material,
    warehouse_location: warehouse_location,
    quantity: quantity,
    legacy_serial_id: legacy_serial_id,
    legacy_batch_number: legacy_batch_number,
    notes: rand < 0.3 ? Faker::Lorem.sentence : nil,
    purchase_date: rand < 0.6 ? Faker::Date.between(from: 1.year.ago, to: Date.today) : nil,
    expiry_date: rand < 0.4 ? Faker::Date.between(from: Date.today, to: 2.years.from_now) : nil,
    cost: rand < 0.5 ? rand(10.0..500.0).round(2) : nil,
    supplier: rand < 0.4 ? Faker::Company.name : nil,
    created_by: user
  )
  # serial_number and batch_number will be auto-generated by the model's before_validation callback
  
  if inventory_item.save
    location_info = warehouse_location ? " at #{warehouse_location.full_path}" : " (no location)"
    generated_number = inventory_item.serial_number || inventory_item.batch_number
    puts "  ✓ Created inventory: #{material.material_code} - #{generated_number} (Qty: #{quantity})#{location_info}"
  else
    puts "  ✗ Failed to create inventory: #{inventory_item.errors.full_messages.join(', ')}"
  end
end

puts "\nInventory Items seeding complete!"
puts "Created #{InventoryItem.where(tenant: tenant).count} total inventory items for #{tenant.name}"

