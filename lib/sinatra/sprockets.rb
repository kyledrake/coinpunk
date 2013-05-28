module Sinatra
  module Sprockets
    def self.registered(app)
      app.extend(ClassMethods)
      app.helpers do
        def production?
          (settings.production_override == true) || self.class.production?
        end
      end

      app.set :asset_digests, {}
      app.set :production_override, false # for the asset compile testing

      # http://stackoverflow.com/questions/10576422/how-do-i-use-sprockets-with-sinatra-without-a-rackup-file
      # https://gist.github.com/jeffreyiacono/1772989
      app.set :assets, ::Sprockets::Environment.new
      app.settings.assets.append_path File.join(DIR_ROOT, 'assets', 'js')
      app.settings.assets.append_path File.join(DIR_ROOT, 'assets', 'css')
      app.precompile_assets! if app.production? && !$0.match(/rake|irb|pry/)

      app.get %r{\/(js|css)\/(.+)} do |folder, filename|
        etag settings.asset_digests[filename] if production?
        content_type mime_type(File.extname(filename))
        settings.assets[filename]
      end
    end

    module ClassMethods
      def precompile_assets!
        settings.assets.js_compressor  = YUI::JavaScriptCompressor.new
        settings.assets.css_compressor = YUI::CssCompressor.new

        print 'Precompiling assets..' unless test?

        Dir["assets/**/*.*"].each do |file_path|
          file = File.basename file_path
          # Just calling settings.assts[file] compiles it..
          settings.asset_digests[file] = Digest::SHA2.new.digest(settings.assets[file].to_s).unpack('H*').first
        end

        print " done.\n" unless test?
      end
    end
  end
end
