class AddOwnerToPlaylists < ActiveRecord::Migration
  def change
    add_column :playlists, :owner, :string
  end
end
