class EmailSendWorker
  include Sidekiq::Worker

  def perform(opts={})
    mail = Mail.deliver do
      to      opts['to']
      from    opts['from']
      subject opts['subject']

      text_part do
        body opts['text_part']
      end

      html_part do
        content_type 'text/html; charset=UTF-8'
        body opts['html_part']
      end
    end
  end 
end