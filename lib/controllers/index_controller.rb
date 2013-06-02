class IndexController < Controller
  get '/' do
    dashboard_if_signed_in
    slim :index
  end

  get '/dashboard' do
    require_login

    @title = 'Dashboard'

    account = Account[email: session[:account_email]]

    addresses_raw, transactions_raw, account_balance_raw = $bitcoin.batch do |client|
      client.rpc 'getaddressesbyaccount', account.email
      client.rpc 'listtransactions', account.email
      client.rpc 'getbalance', account.email
    end

    @addresses_received = $bitcoin.batch do
      addresses_raw['result'].each {|a| rpc 'getreceivedbyaddress', a}
    end.collect{|a| a['result']}

    @account            = account
    @addresses          = addresses_raw['result']
    @transactions       = transactions_raw['result']
    @account_balance    = account_balance_raw['result']

    slim :dashboard
  end

  post '/set_timezone' do
    session[:timezone] = params[:name]
  end

  get '/signout' do
    require_login
    session[:account_email] = nil
    session[:timezone] = nil
    redirect '/'
  end
end