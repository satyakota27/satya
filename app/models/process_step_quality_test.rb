class ProcessStepQualityTest < ApplicationRecord
  belongs_to :process_step
  belongs_to :quality_test

  validates :process_step_id, uniqueness: { scope: :quality_test_id }
end

