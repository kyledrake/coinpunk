require File.join File.dirname(__FILE__), 'config', 'config'

map('/accounts')      { run AccountsController }
map('/transactions')  { run TransactionsController }
map('/')              { run IndexController }