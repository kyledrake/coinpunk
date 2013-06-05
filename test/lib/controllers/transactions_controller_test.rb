require_relative '../../controller_config.rb'

describe TransactionsController do
  before do
    @controller = TransactionsController
    Sinatra::Sessionography.session.clear
    Mail::TestMailer.deliveries.clear
    # WebMock.reset!
  end
  
  describe 'send' do

    describe 'with bad bitcoin address' do
      it 'fails' do
        account = Fabricate :account
        login_as account.email

        stub_request(:post, api_url).
          with(
            body: {jsonrpc: '2.0', 
                   method: 'sendfrom', 
                   params: [account.email, 'badaddress', 0.001, TransactionsController::MINIMUM_SEND_CONFIRMATIONS, nil, nil]},
            headers: {'Content-Type' => 'application/json'}
          ).
          to_return(status: 500, body: {error: {code: '-5', message: 'Invalid Bitcoin address'}}.to_json)

        post '/send', to_address: 'badaddress', amount: 0.001
        headers['Location'].must_match /\/dashboard$/
        Sinatra::Sessionography.session[:flash][:error].must_match /invalid bitcoin address/i
      end
    end

    describe 'with bitcoin address' do
      it 'sends' do
        account = Fabricate :account
        login_as account.email
        
        stub_request(:post, api_url).
          with(
            body: {jsonrpc: '2.0', 
                   method: 'sendfrom', 
                   params: [account.email, '17xLQo6zksBNYuWaRq1N4yfeqMkb4kMaMP', 0.001, TransactionsController::MINIMUM_SEND_CONFIRMATIONS, nil, nil]},
            headers: {'Content-Type' => 'application/json'}
          ).
          to_return(status: 200, body: {result: 'transaction_id'}.to_json)
          
          post '/send', to_address: '17xLQo6zksBNYuWaRq1N4yfeqMkb4kMaMP', amount: 0.001
          headers['Location'].must_match /\/dashboard$/
          Sinatra::Sessionography.session[:flash][:success].must_match /sent 0.001 BTC to 17xLQo6zksBNYuWaRq1N4yfeqMkb4kMaMP/i
      end
    end
    
    describe 'with bitcoin address' do
      it 'sends' do
        account = Fabricate :account
        login_as account.email
        
        stub_request(:post, api_url).
          with(
            body: {jsonrpc: '2.0', 
                   method: 'sendfrom', 
                   params: [account.email, '17xLQo6zksBNYuWaRq1N4yfeqMkb4kMaMP', 0.001, TransactionsController::MINIMUM_SEND_CONFIRMATIONS, nil, nil]},
            headers: {'Content-Type' => 'application/json'}
          ).
          to_return(status: 200, body: {result: 'transaction_id'}.to_json)
          
          post '/send', to_address: '17xLQo6zksBNYuWaRq1N4yfeqMkb4kMaMP', amount: 0.001
          headers['Location'].must_match /\/dashboard$/
          Sinatra::Sessionography.session[:flash][:success].must_match /sent 0.001 BTC to 17xLQo6zksBNYuWaRq1N4yfeqMkb4kMaMP/i
      end
    end
    
    describe 'with email address' do
      
      it 'sends for existing email address in system' do
        account = Fabricate :account
        recipient_account = Fabricate :account
        receiving_bitcoin_address = recipient_account.receive_addresses.first.bitcoin_address
        
        login_as account.email
        
        stub_rpc 'getaccountaddress', [recipient_account.email], body: {result: receiving_bitcoin_address}
        stub_rpc 'sendfrom', [account.email, receiving_bitcoin_address, 0.001, TransactionsController::MINIMUM_SEND_CONFIRMATIONS, nil, nil], body: {result: 'transaction_id'}

        post '/send', to_address: recipient_account.email, amount: 0.001
        a = Account[email: recipient_account.email]
        a.password.must_equal recipient_account.password
        a.temporary_password.must_equal false

        Mail::TestMailer.deliveries.length.must_equal 0
      end
      
      it 'sends and creates account' do
        account = Fabricate :account
        
        send_to_email = Fabricate.attributes_for(:account)[:email]
        login_as account.email

        stub_rpc 'getaccountaddress', [send_to_email], body: {result: '17xLQo6zksBNYuWaRq1N4yfeqMkb4kMaMP'}
        stub_rpc 'sendfrom', [account.email, '17xLQo6zksBNYuWaRq1N4yfeqMkb4kMaMP', 0.001, TransactionsController::MINIMUM_SEND_CONFIRMATIONS, nil, nil], body: {result: 'transaction_id'}
          
        post '/send', to_address: send_to_email, amount: 0.001
        headers['Location'].must_match /\/dashboard$/
        
        mail = Mail::TestMailer.deliveries.first
        mail.from.must_equal [CONFIG['email_from']]
        mail.to.must_equal [send_to_email]
        mail.subject.must_match /you have just received bitcoins/i
        
        text_part = mail.text_part.to_s
        text_part.must_match /0.001.+#{account.email}.+http:\/\/example.org.+#{send_to_email}/m
        mail.html_part.to_s.must_match /0.001.+#{account.email}.+http:\/\/example.org.+#{send_to_email}/m
        temporary_password = text_part.match(/temporary password: (.+)/i).captures.first.strip!
        Account.valid_login?(send_to_email, temporary_password).must_equal true
        Account[email: send_to_email].temporary_password.must_equal true
        Sinatra::Sessionography.session[:flash][:success].must_match /sent 0.001 BTC to #{send_to_email}/i
        headers['Location'].must_match /\/dashboard$/
      end
    end
    
  end
end
