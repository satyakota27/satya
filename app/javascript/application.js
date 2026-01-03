// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import initFunctionalitySelection from "./functionality_selection"
import initMaterials from "./materials"
import initQualityTests from "./quality_tests"
import initProcessSteps from "./process_steps"
import initInventoryItems from "./inventory_items"
import initWarehouseLocations from "./warehouse_locations"

initFunctionalitySelection()

document.addEventListener('turbo:load', initMaterials)
document.addEventListener('DOMContentLoaded', initMaterials)
document.addEventListener('turbo:load', initQualityTests)
document.addEventListener('DOMContentLoaded', initQualityTests)
document.addEventListener('turbo:load', initProcessSteps)
document.addEventListener('DOMContentLoaded', initProcessSteps)
document.addEventListener('turbo:load', initInventoryItems)
document.addEventListener('DOMContentLoaded', initInventoryItems)
document.addEventListener('turbo:load', initWarehouseLocations)
document.addEventListener('DOMContentLoaded', initWarehouseLocations)
