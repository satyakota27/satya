require "test_helper"

class SubFunctionalitiesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get sub_functionalities_index_url
    assert_response :success
  end

  test "should get show" do
    get sub_functionalities_show_url
    assert_response :success
  end

  test "should get new" do
    get sub_functionalities_new_url
    assert_response :success
  end

  test "should get create" do
    get sub_functionalities_create_url
    assert_response :success
  end

  test "should get edit" do
    get sub_functionalities_edit_url
    assert_response :success
  end

  test "should get update" do
    get sub_functionalities_update_url
    assert_response :success
  end

  test "should get destroy" do
    get sub_functionalities_destroy_url
    assert_response :success
  end
end
