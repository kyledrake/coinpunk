require_relative './environment'

include Rack::Test::Methods

def app;     App end
def status;  last_response.status end
def headers; last_response.headers end
def body;    last_response.body end

SimpleCov.command_name 'minitest'

describe 'index' do
  it 'loads' do
    get '/'
    body.must_match /Coinpunk.+form.+signin/
  end
end

describe 'signin' do
  it 'fails for missing login' do
    post '/accounts/signin', email: 'fail@example.com', password: 'lol'
    fail_signin
  end

  it 'fails for bad password' do
    @account = Fabricate :account
    post '/accounts/signin', email: @account.email, password: 'derp'
    fail_signin
  end

  it 'fails for no input' do
    post '/accounts/signin'
    fail_signin
  end

  it 'succeeds for valid input' do
    password = '1tw0rkz'
    @account = Fabricate :account, password: password
    post '/accounts/signin', email: @account.email, password: password
    headers['Location'].must_equal 'http://example.org/dashboard'
    mock_dashboard_calls @account.email
    get '/dashboard'
    body.must_match /Dashboard/
  end
end

def fail_signin
  headers['Location'].must_equal 'http://example.org/'
  get '/'
  body.must_match /invalid login/i
end

def api_url
  uri = Addressable::URI.parse $config['bitcoind_rpchost'] ? $config['bitcoind_rpchost'] : 'http://localhost'
  uri.port = 8332 if uri.port.nil?
  uri.user = $config['bitcoind_rpcuser'] if uri.user.nil?
  uri.password = $config['bitcoind_rpcpassword'] if uri.password.nil?
  "#{uri.to_s}/"
end

def mock_dashboard_calls(email)
  address = SecureRandom.hex

  stub_request(:post, api_url).
    with(
      body: [
        {method: 'getaddressesbyaccount', params: [email], jsonrpc: '2.0'},
        {method: 'listtransactions', params: [email], jsonrpc: '2.0'},
        {method: 'getbalance', params: [email], jsonrpc: '2.0'}
      ].to_json,
      headers: {'Content-Type' => 'application/json'}
    ).to_return(body: [
      {result: [address]},
      {result: [{
        account: email,
        address: address,
        category: 'send',
        amount: -0.01000000,
        fee: -0.00050000
       }]},
      {result: 31337.00}
    ].to_json
  )

  stub_request(:post, api_url).
    with(
      body: [{method: 'getreceivedbyaddress', params: [address], jsonrpc: '2.0'}].to_json,
      headers: {'Content-Type' => 'application/json'}
    ).to_return(body: [{result: 0.03}].to_json)
end
