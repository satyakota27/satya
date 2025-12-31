// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import initFunctionalitySelection from "./functionality_selection"
import initMaterials from "./materials"

initFunctionalitySelection()

document.addEventListener('turbo:load', initMaterials)
document.addEventListener('DOMContentLoaded', initMaterials)
