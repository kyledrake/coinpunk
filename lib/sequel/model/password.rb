require 'bcrypt'

module Sequel
  class Model
    module Password
      def self.included(base)
        base.extend(ClassMethods)
      end

      module ClassMethods
        def valid_login?(column, value, plaintext)
          user = self[column.to_sym => value]
          return false if user.nil?
          user.valid_password? plaintext
        end

        def bcrypt_cost
          @bcrypt_cost
        end

        def bcrypt_cost=(cost)
          @bcrypt_cost = cost
        end
      end

      def valid_password?(plaintext)
        BCrypt::Password.new(values[:password]) == plaintext
      end

      def password=(plaintext)
        @password_length = plaintext.nil? ? 0 : plaintext.length
        @password_plaintext = plaintext
        values[:password] = BCrypt::Password.create plaintext, cost: (self.class.bcrypt_cost || BCrypt::Engine::DEFAULT_COST)
      end
    end
  end
end
