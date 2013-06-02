require_relative '../../controller_config.rb'

describe IndexController do
  before do
    @controller = IndexController
    Sinatra::Sessionography.session.clear
  end

  describe 'index' do
    it 'loads' do
      get '/'
      body.must_match /Coinpunk.+form.+signin/
    end
  end

  describe 'dashboard' do
    it 'works for valid account' do
      @account = Fabricate :account
      mock_dashboard_calls @account.email
      Sinatra::Sessionography.session[:account_email] = @account.email
      get '/dashboard'
      body.must_match /Dashboard/
    end
  end


  describe 'temporary account login' do
  end


  it 'loads the front page' do
    get '/'
    last_response.body.must_match /Coinpunk/
  end

  it 'works with sprockets for the most part' do
    get '/js/all.js'
    last_response.body.must_match /jquery/i

    get '/css/screen.css'
    last_response.length.wont_equal 0
    last_response.body.wont_match /jquery/i
  end

  it 'precompiles js assets in production and sets etag' do
    skip
    @controller.precompile_assets!
    get '/js/all.js'
    regular_files = ''
    Dir['assets/**/*.js'].each {|f| regular_files << File.read(f)}
    (last_response.body.length < regular_files.length).must_equal true

    last_response.headers['ETag'].must_be_nil

    @controller.set :production_override, true
    current_session.header 'lol', 'cats'
    get '/js/all.js'
    last_response.headers['ETag'].must_equal %{"#{@controller.settings.asset_digests['all.js']}"}

    # This works in production, but doesn't work here for some reason..
    get '/js/all.js', {}, {'HTTP_IF_NONE_MATCH' => @controller.settings.asset_digests['all.js']}
    last_response.status.must_equal 304
  end
end
