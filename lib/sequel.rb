module Sequel
  extension :named_timezones
  extension :thread_local_timezones
  extension :pagination

  default_timezone = :utc
  self.datetime_class = Time
end

%w[
  model
].require_each_from 'sequel'
