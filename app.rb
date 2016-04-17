require 'sinatra'
require 'sinatra/activerecord'
require './config/environments'
require './models/playlist.rb'

get '/' do
  redirect '/new'
end

get '/new' do
  erb :new
end

get '/:playlist_id' do
  playlist = Playlist.find_by(url_id: params[:playlist_id])
  "Playlist! #{params[:playlist_id]}"
end

post '/new' do
  name = params[:playlist_name]
  users = params[:user_data]
  url_id = SecureRandom.hex(3)

  playlist = Playlist.new(name: name, url_id: url_id, users: users)
  counter = 10
  if playlist.save
    redirect "/#{url_id}"
  else
    until playlist.save || counter <= 0 do
      playlist.url_id = SecureRandom.hex(3)
      counter -= 1
    end
    redirect "/#{url_id}"
  end
end
