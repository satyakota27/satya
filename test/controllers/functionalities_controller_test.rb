require "test_helper"

class FunctionalitiesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get functionalities_index_url
    assert_response :success
  end

  test "should get show" do
    get functionalities_show_url
    assert_response :success
  end

  test "should get new" do
    get functionalities_new_url
    assert_response :success
  end

  test "should get create" do
    get functionalities_create_url
    assert_response :success
  end

  test "should get edit" do
    get functionalities_edit_url
    assert_response :success
  end

  test "should get update" do
    get functionalities_update_url
    assert_response :success
  end

  test "should get destroy" do
    get functionalities_destroy_url
    assert_response :success
  end
end
