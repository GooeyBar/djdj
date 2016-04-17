class AddUsersToPlaylists < ActiveRecord::Migration
  def change
    add_column :playlists, :users, :text
  end
end
