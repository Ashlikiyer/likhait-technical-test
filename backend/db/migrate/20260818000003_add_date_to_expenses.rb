class AddDateToExpenses < ActiveRecord::Migration[7.2]
  def up
    add_column :expenses, :date, :date

    execute <<~SQL
      UPDATE expenses
      SET date = DATE(created_at)
      WHERE date IS NULL
    SQL

    change_column_null :expenses, :date, false
  end

  def down
    remove_column :expenses, :date
  end
end
