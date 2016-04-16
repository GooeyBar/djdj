require 'sinatra'
require 'sinatra/activerecord'
require './config/environments'

get '/' do
  "foo"
end

get '/:playlist_id' do
  playlist = Playlist.find_by(url_id: params[:playlist_id])
  "#{playlist.name} : #{playlist.owner} : #{playlist.url_id}"
end

get '/new' do
  erb :new
end

post '/new' do
  owner = params[:owner]
  name = params[:name]
  url_id = SecureRandom.hex(3)

  playlist = Playlist.new(owner: owner, name: name, url_id: url_id)

  if playlist.save
    redirect "/#{url_id}"
  else
    until playlist.save
      playlist.url_id = SecureRandom.hex(3)
    end
    redirect "/#{url_id}"
  end
end
