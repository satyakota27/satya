require "test_helper"

class QualityTestsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get quality_tests_index_url
    assert_response :success
  end

  test "should get show" do
    get quality_tests_show_url
    assert_response :success
  end

  test "should get new" do
    get quality_tests_new_url
    assert_response :success
  end

  test "should get edit" do
    get quality_tests_edit_url
    assert_response :success
  end
end
