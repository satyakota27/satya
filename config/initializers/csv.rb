# Ensure CSV gem is loaded for Ruby 3.4+
begin
  require 'csv'
rescue LoadError => e
  Rails.logger.warn "Could not load CSV gem: #{e.message}"
end

