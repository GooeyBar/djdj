class CreatePlaylists < ActiveRecord::Migration
  def up
    create_table :playlists do |t|
      t.timestamps
    end
  end

  def down
    drop_table :playlists
  end
end
