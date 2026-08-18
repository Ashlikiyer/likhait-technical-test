require 'rails_helper'

RSpec.describe "Api::Expenses", type: :request do
  let!(:food_category) { Category.find_or_create_by!(name: "Food") }
  let!(:transport_category) { Category.find_or_create_by!(name: "Transport") }

  describe "GET /api/expenses" do
    let!(:expense1) { Expense.create!(description: "Lunch", amount: 100.00, category: food_category, date: Date.today, payer_name: "Alex") }
    let!(:expense2) { Expense.create!(description: "Taxi", amount: 50.00, category: transport_category, date: Date.today, payer_name: "Jordan") }

    it "returns all expenses with category information" do
      get "/api/expenses"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
    end

    it "returns expenses in descending order by date" do
      get "/api/expenses"

      json = JSON.parse(response.body)
      expect(json.first["id"]).to eq(expense2.id)
      expect(json.last["id"]).to eq(expense1.id)
    end
  end

  describe "POST /api/expenses" do
    context "with valid parameters" do
      let(:valid_params) do
        {
          expense: {
            description: "Team Lunch",
            amount: 150.50,
            category_id: food_category.id,
            date: Date.today,
            payer_name: "Sam"
          }
        }
      end

      it "creates a new expense" do
        expect {
          post "/api/expenses", params: valid_params, as: :json
        }.to change(Expense, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["description"]).to eq("Team Lunch")
        expect(json["amount"]).to eq(150.5)
      end
    end

    context "with invalid parameters" do
      it "rejects future dates" do
        invalid_params = {
          expense: {
            description: "Future expense",
            amount: 100.00,
            category_id: food_category.id,
            date: Date.tomorrow,
            payer_name: "Alex"
          }
        }

        expect {
          post "/api/expenses", params: invalid_params, as: :json
        }.not_to change(Expense, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)["errors"]).to include("Date cannot be in the future")
      end

      it "with negative amounts" do
        invalid_params = {
          expense: {
            description: "Invalid expense",
            amount: -100.00,
            category_id: food_category.id,
            date: Date.today,
            payer_name: "Taylor"
          }
        }

        expect {
          post "/api/expenses", params: invalid_params, as: :json
        }.to change(Expense, :count).by(1)

        expect(response).to have_http_status(:created)
      end

      it "with empty descriptions" do
        invalid_params = {
          expense: {
            description: "",
            amount: 100.00,
            category_id: food_category.id,
            date: Date.today,
            payer_name: "Alex"
          }
        }

        expect {
          post "/api/expenses", params: invalid_params, as: :json
        }.to change(Expense, :count).by(1)

        expect(response).to have_http_status(:created)
      end
    end
  end

  describe "PATCH /api/expenses/:id" do
    let!(:expense) do
      Expense.create!(
        description: "Existing expense",
        amount: 100.00,
        category: food_category,
        date: Date.today,
        payer_name: "Alex"
      )
    end

    it "rejects changing an expense to a future date" do
      patch "/api/expenses/#{expense.id}",
            params: { expense: { date: Date.tomorrow } },
            as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)["errors"]).to include("Date cannot be in the future")
      expect(expense.reload.date).to eq(Date.today)
    end
  end
end
