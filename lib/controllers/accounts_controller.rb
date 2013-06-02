class AccountsController < Controller
  get '/accounts/new' do
    dashboard_if_signed_in
    @account = Account.new
    slim :'accounts/new'
  end

  post '/accounts/signin' do
    if (Account.valid_login?(params[:email], params[:password]))
      session[:account_email] = params[:email]

      if current_account.temporary_password
        session[:temporary_password] = true
        redirect '/accounts/change_temporary_password'
      end

      redirect '/dashboard'
    else
      flash[:error] = 'Invalid login.'
      redirect '/'
    end
  end

  get '/accounts/change_temporary_password' do
    slim :'accounts/change_temporary_password'
  end

  post '/accounts/change_temporary_password' do
    current_account.password = params[:password]

    if current_account.valid?
      current_account.temporary_password = false
      current_account.save
      session[:temporary_password] = false
      flash[:success] = 'Temporary password changed. Welcome to Coinpunk!'
      redirect '/dashboard'
    else
      slim :'accounts/change_temporary_password'
    end
  end

  post '/accounts/create' do
    dashboard_if_signed_in

    @account = create_account params[:email], params[:password]

    if @account.new? # invalid
      slim :'accounts/new'
    else
      session[:account_email] = @account.email
      flash[:success] = 'Account successfully created!'
      redirect '/dashboard'
    end
  end

  post '/addresses/create' do
    require_login
    address = bitcoin_rpc 'getnewaddress', session[:account_email]
    Account[email: session[:account_email]].add_receive_address name: params[:name], bitcoin_address: address
    flash[:success] = "Created new receive address \"#{params[:name]}\" with address \"#{address}\"."
    redirect '/dashboard'
  end
end