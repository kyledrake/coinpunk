require './environment.rb'

class App < Sinatra::Base
  MINIMUM_SEND_CONFIRMATIONS = 1

  register Sinatra::Flash

  configure do
    use Rack::Session::Cookie, key:          'website',
                               path:         '/',
                               expire_after: 31556926, # one year in seconds
                               secret:       $config['session_secret']

    use Rack::TimeZoneHeader

    error     { slim :error }      if production?
    not_found { slim :not_found }  if production?
  end

  before do
    @timezone_name = session[:timezone]

    if @timezone_name
      @timezone = TZInfo::Timezone.get(@timezone_name)
      @timezone_identifier = @timezone.current_period.zone_identifier
      @timezone_offset = @timezone.current_period.utc_total_offset
    end
  end

  post '/set_timezone' do
    session[:timezone] = params[:name]
  end

  get '/' do
    dashboard_if_signed_in
    slim :index
  end

  get '/dashboard' do
    redirect '/' unless signed_in?

    @title = 'Dashboard'
    @account = Account[email: session[:account_email]]
    @email = session[:account_email]
    @time_zone = request.env["time.zone"]
    
    threads = []

    threads << Thread.new {
      @addresses = bitcoin_rpc 'getaddressesbyaccount', @email
      @addresses_received = @addresses.collect {|a| bitcoin_rpc('getreceivedbyaddress', a)}
    }

    threads << Thread.new {
      @transactions = bitcoin_rpc('listtransactions', @email).reverse!
    }

    threads << Thread.new {
      @account_balance = bitcoin_rpc 'getbalance', @email
    }

    threads.each {|t| t.join}

    slim :dashboard
  end

  get '/accounts/new' do
    dashboard_if_signed_in
    @account = Account.new
    slim :'accounts/new'
  end

  get '/signout' do
    session[:account_email] = nil
    session[:timezone] = nil
    redirect '/'
  end

  post '/send' do
    transaction_id = bitcoin_rpc(
      'sendfrom',
      session[:account_email],
      params[:tobitcoinaddress],
      params[:amount].to_f,
      MINIMUM_SEND_CONFIRMATIONS,
      params[:comment],
      params[:'comment-to']
    )

    flash[:success] = "Sent #{params[:amount]} BTC to #{params[:tobitcoinaddress]}."
    redirect '/'
  end

  post '/accounts/signin' do
    if Account.valid_login? params[:email], params[:password]
      session[:account_email] = params[:email]
      redirect '/dashboard'
    else
      flash[:error] = 'Invalid login.'
      redirect '/'
    end
  end

  post '/accounts/create' do
    dashboard_if_signed_in

    @account = Account.new email: params[:email], password: params[:password]
    if @account.valid?

      DB.transaction do
        @account.save
        address = bitcoin_rpc 'getaccountaddress', params[:email]
        @account.add_receive_address name: 'Default', bitcoin_address: address
      end

      session[:account_email] = @account.email
      flash[:success] = 'Account successfully created!'
      redirect '/dashboard'
    else
      slim :'accounts/new'
    end
  end

  post '/addresses/create' do
    address = bitcoin_rpc 'getnewaddress', session[:account_email]
    Account[email: session[:account_email]].add_receive_address name: params[:name], bitcoin_address: address
    flash[:success] = "Created new receive address \"#{params[:name]}\" with address \"#{address}\"."
    redirect '/dashboard'
  end

  def dashboard_if_signed_in
    redirect '/dashboard' if signed_in?
  end

  def signed_in?
    !session[:account_email].nil?
  end

  def bitcoin_rpc(meth, *args)
    $bitcoin.send(meth, *args)
  end
  
  def render(engine, data, options = {}, locals = {}, &block)
    options.merge!(pretty: self.class.development?) if engine == :slim && options[:pretty].nil?
    super engine, data, options, locals, &block
  end
end