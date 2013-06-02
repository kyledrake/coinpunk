require File.join File.dirname(__FILE__), 'config', 'config'

map('/')              { run IndexController }
map('/accounts')      { run AccountsController }
map('/transactions')  { run TransactionsController }