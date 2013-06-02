module Sequel
  class Model
    # http://sequel.rubyforge.org/rdoc-plugins/classes/Sequel/Plugins/ValidationHelpers.html
    plugin :validation_helpers

    # http://sequel.rubyforge.org/rdoc-plugins/classes/Sequel/Plugins/ForceEncoding.html
    plugin :force_encoding, 'UTF-8'

    # http://sequel.rubyforge.org/rdoc-plugins/classes/Sequel/Plugins/SkipCreateRefresh.html
    # plugin :skip_create_refresh

    # http://sequel.rubyforge.org/rdoc-plugins/classes/Sequel/Plugins/Timestamps.html
    plugin :timestamps, create: :created_at, update: :updated_at

    # http://sequel.rubyforge.org/rdoc-plugins/classes/Sequel/Plugins/DefaultsSetter.html
    plugin :defaults_setter
  end
end
