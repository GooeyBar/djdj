class AddUrlIdToPlaylists < ActiveRecord::Migration
  def change
    add_column :playlists, :url_id, :string
  end
end
