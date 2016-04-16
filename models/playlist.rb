class Playlist < ActiveRecord::Base
  validates_presence_of :url_id, :name, :owner
  validates_uniqueness_of :url_id
end
