module Rack
  class Request
    def url_without_path
      url = scheme + "://"
      url << host

      if scheme == "https" && port != 443 ||
         scheme == "http" && port != 80
        url << ":#{port}"
      end

      url
    end
  end
end
