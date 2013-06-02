class TransactionsController < Controller
  post '/transactions/send' do
    require_login

    if params[:to_address].match Account::EMAIL_VALIDATION_REGEX
      # receiving_address = bitcoin_rpc 'getaccountaddress', params[:to_address]
      @temporary_password = Pwqgen.new.generate 2
      @account = create_account params[:to_address], @temporary_password, true
      @sending_email = session[:account_email]
      @amount = params[:amount]
      @comment = params[:comment]
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
        from: CONFIG['email_from'],
        to: params[:to_address],
        subject: "You have just received Bitcoins!",
        html_part: slim(:email_sent_bitcoins, layout: false)
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

  get '/transactions/:txid' do
    require_login
    @transaction = bitcoin_rpc 'gettransaction', params[:txid]
    slim :'transactions/view'
  end
end