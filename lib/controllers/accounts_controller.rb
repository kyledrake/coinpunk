class AccountsController < Controller
  get '/new' do
    dashboard_if_signed_in
    @account = Account.new
    slim :'accounts/new'
  end

  post '/signin' do
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

  get '/change_temporary_password' do
    slim :'accounts/change_temporary_password'
  end

  post '/change_temporary_password' do
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

  post '/create' do
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
end