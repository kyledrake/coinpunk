class Controller < Sinatra::Base
  register Sinatra::Sprockets
  register Sinatra::ControllerHelpers
  register Sinatra::ViewHelpers
  register Sinatra::Flash

  configure do
    precompile_assets! if (production? || ENV['TRAVIS']) && RUBY_PLATFORM != 'java'

    if test?
      require 'sinatra/sessionography'
      helpers Sinatra::Sessionography
    end


    $bitcoin = Silkroad::Client.new CONFIG['bitcoind_uri']

    use Rack::Session::Cookie, key:          'coinpunk',
                               path:         '/',
                               expire_after: 31556926, # one year in seconds
                               secret:       CONFIG['session_secret']

    set :root, DIR_ROOT

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

    redirect '/accounts/change_temporary_password' if session[:temporary_password] == true && !(request.path =~ /change_temporary_password/)
  end

  def render(engine, data, options = {}, locals = {}, &block)
    options.merge!(pretty: self.class.development?) if engine == :slim && options[:pretty].nil?
    super engine, data, options, locals, &block
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

  def create_account(email, password, temporary_password=false)
    account = Account.new email: email, password: password, temporary_password: temporary_password

    if account.valid?
      DB.transaction do
        account.save
        address = bitcoin_rpc 'getaccountaddress', email
        account.add_receive_address name: 'Default', bitcoin_address: address
      end
    end

    account
  end

end

%w[
  index_controller
  accounts_controller
  transactions_controller
].require_each_from 'controllers'
