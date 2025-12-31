// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import initFunctionalitySelection from "./functionality_selection"
import initMaterials from "./materials"
import initQualityTests from "./quality_tests"

initFunctionalitySelection()

document.addEventListener('turbo:load', initMaterials)
document.addEventListener('DOMContentLoaded', initMaterials)
document.addEventListener('turbo:load', initQualityTests)
document.addEventListener('DOMContentLoaded', initQualityTests)
