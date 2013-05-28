module Sinatra
  module ViewHelpers
    def self.registered(app)
      app.helpers do
        def timestamp_to_formatted_time(timestamp)
          return '' if timestamp.nil?
          Time.at(timestamp).getlocal(@timezone_offset).strftime('%b %-d, %Y %H:%M '+@timezone_identifier.to_s)
        end

        def format_amount(amount)
          ("%.6f" % amount).sub(/\.?0*$/, "")
        end

        def current_account
          @current_account ||= Account[email: session[:account_email]]
        end
      end
    end
  end
end
