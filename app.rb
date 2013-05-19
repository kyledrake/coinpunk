require File.join(File.expand_path(File.dirname(__FILE__)), 'environment.rb')

class App < Sinatra::Base
  MINIMUM_SEND_CONFIRMATIONS = 1

  register Sinatra::Flash

  configure do
    $bitcoin = Silkroad::Client.new(
      $config['bitcoind_rpcuser'], 
      $config['bitcoind_rpcpassword'],
      url: $config['bitcoind_rpchost']
    )
    
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

  post '/send' do
    require_login

    if params[:to_address].match Account::EMAIL_VALIDATION_REGEX
      # receiving_address = bitcoin_rpc 'getaccountaddress', params[:to_address]
      @temporary_password = Pwqgen.new.generate 2
      @account = create_account params[:to_address], @temporary_password
      @sending_email = session[:account_email]
      @amount = params[:amount]
      @url = request.url_without_path

      transaction_id = bitcoin_rpc(
        'sendfrom',
        session[:account_email],
        @account.receive_addresses.first.bitcoin_address,
        params[:amount].to_f,
        0,
        params[:comment],
        params[:'comment-to']
      )

      EmailSendWorker.perform_async({
        from: $config['email_from'],
        to: params[:to_address],
        subject: "You have just received Bitcoins!",
        html_part: erb(:email_sent_bitcoins, layout: false)
      })

      flash[:success] = "Sent #{params[:amount]} BTC to #{params[:to_address]}."

      redirect '/dashboard'
    end
    
    # sending to bitcoin address
    begin
      transaction_id = bitcoin_rpc(
        'sendfrom',
        session[:account_email],
        params[:to_address],
        params[:amount].to_f,
        MINIMUM_SEND_CONFIRMATIONS,
        params[:comment],
        params[:'comment-to']
      )
    rescue Silkroad::Client::Error => e
      flash[:error] = "Unable to send bitcoins: #{e.message}"
      redirect '/dashboard'
    end

    flash[:success] = "Sent #{params[:amount]} BTC to #{params[:to_address]}."
    redirect '/dashboard'
  end

  get '/transaction/:txid' do
    require_login
    @transaction = bitcoin_rpc 'gettransaction', params[:txid]
    slim :'transactions/view'
  end

  get '/accounts/new' do
    dashboard_if_signed_in
    @account = Account.new
    slim :'accounts/new'
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

  post '/set_timezone' do
    session[:timezone] = params[:name]
  end

  get '/signout' do
    require_login
    session[:account_email] = nil
    session[:timezone] = nil
    redirect '/'
  end

  def dashboard_if_signed_in
    redirect '/dashboard' if signed_in?
  end

  def require_login
    redirect '/' unless signed_in?
  end

  def signed_in?
    !session[:account_email].nil?
  end

  def bitcoin_rpc(meth, *args)
    $bitcoin.rpc(meth, *args)
  end

  def render(engine, data, options = {}, locals = {}, &block)
    options.merge!(pretty: self.class.development?) if engine == :slim && options[:pretty].nil?
    super engine, data, options, locals, &block
  end
  
  def create_account(email, password)
    account = Account.new email: email, password: password

    if account.valid?
      DB.transaction do
        account.save
        address = bitcoin_rpc 'getaccountaddress', email
        account.add_receive_address name: 'Default', bitcoin_address: address
      end
    end

    account
  end
  
  helpers do
    def timestamp_to_formatted_time(timestamp)
      return '' if timestamp.nil?
      Time.at(timestamp).getlocal(@timezone_offset).strftime('%b %-d, %Y %H:%M '+@timezone_identifier.to_s)
    end
    
    def format_amount(amount)
      ("%.6f" % amount).sub(/\.?0*$/, "")
    end
  end
end