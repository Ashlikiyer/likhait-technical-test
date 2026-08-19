class AddIndexesForPerformance < ActiveRecord::Migration[7.0]
  def change
    add_index :expenses, :date, if_not_exists: true
    add_index :expenses, :category_id, if_not_exists: true
    add_index :expenses, [:date, :category_id], if_not_exists: true
  end
end