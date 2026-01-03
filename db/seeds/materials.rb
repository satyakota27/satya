require 'faker'

puts "\n=== Seeding Materials ==="

# Get tenant and units
tenant = Tenant.find_by(subdomain: 'acme') || Tenant.first
approver = User.find_by(email: 'admin@acme.com') || User.where(role: 'tenant_admin').first || User.super_admin.first

unless tenant
  puts "ERROR: No tenant found. Please run main seeds first."
  exit
end

units = UnitOfMeasurement.where(tenant: tenant).active
if units.empty?
  puts "ERROR: No units of measurement found. Please create units first."
  exit
end

procurement_unit = units.first
sale_unit = units.first

# Material descriptions - realistic examples
material_descriptions = [
  "Steel Rod 10mm Diameter",
  "Aluminum Sheet 2mm Thickness",
  "Copper Wire 12 AWG",
  "Plastic Resin HDPE Grade A",
  "Rubber Gasket Standard Size",
  "Stainless Steel Bolt M8x20",
  "Carbon Fiber Sheet 1mm",
  "Brass Fitting 1/2 inch NPT",
  "PVC Pipe 4 inch Schedule 40",
  "Ceramic Insulator Type A",
  "Glass Panel Tempered 6mm",
  "Wooden Board Oak 2x4",
  "Concrete Mix Ready-Mix 3000 PSI",
  "Paint Primer White 1 Gallon",
  "Adhesive Epoxy High Strength",
  "Fabric Canvas Heavy Duty",
  "Leather Hide Full Grain",
  "Paper Cardstock 80lb",
  "Foam Padding High Density",
  "Metal Bracket L-Shaped"
]

tracking_types = ['unit', 'batch']
states = ['approved', 'approved', 'approved', 'approved', 'draft'] # Mostly approved

20.times do |i|
  description = material_descriptions[i] || Faker::Commerce.product_name
  tracking_type = tracking_types.sample
  state = states.sample
  
  # Check if material already exists (idempotent)
  existing = Material.find_by(tenant: tenant, description: description)
  if existing
    puts "  ⊙ Material already exists: #{existing.material_code || 'Draft'} - #{existing.description}"
    next
  end
  
  material = Material.new(
    tenant: tenant,
    description: description,
    tracking_type: tracking_type,
    state: state,
    procurement_unit: procurement_unit,
    sale_unit: sale_unit,
    has_bom: [true, false].sample,
    has_shelf_life: [true, false].sample,
    has_minimum_stock_value: [true, false].sample,
    has_minimum_reorder_value: [true, false].sample
  )
  
  # Set shelf life if enabled
  if material.has_shelf_life?
    material.shelf_life_years = [0, 0, 1, 2].sample
    material.shelf_life_months = [0, 6, 12, 18, 24].sample
    material.shelf_life_days = [0, 30, 60, 90].sample
  end
  
  # Set minimum stock values if enabled
  if material.has_minimum_stock_value?
    material.minimum_stock_value = rand(10..100)
  end
  
  if material.has_minimum_reorder_value?
    material.minimum_reorder_value = rand(5..50)
  end
  
  # Set sample size for batch tracking
  if material.batch?
    material.sample_size = rand(5..20)
  end
  
  # Set state and approver if approved
  if state == 'approved'
    material.state = 'approved'
    material.approved_by = approver
    material.approved_at = Faker::Time.between(from: 30.days.ago, to: Time.current)
    # Material code will be auto-generated
  end
  
  if material.save
    puts "  ✓ Created material: #{material.material_code || 'Draft'} - #{material.description}"
  else
    puts "  ✗ Failed to create material: #{material.errors.full_messages.join(', ')}"
  end
end

puts "\nMaterials seeding complete!"
puts "Created #{Material.where(tenant: tenant).count} total materials for #{tenant.name}"

