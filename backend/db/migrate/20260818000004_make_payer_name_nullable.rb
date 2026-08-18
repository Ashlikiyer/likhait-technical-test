class MakePayerNameNullable < ActiveRecord::Migration[7.2]
  def change
    change_column_null :expenses, :payer_name, true
    change_column_default :expenses, :payer_name, from: nil, to: ''
  end
end