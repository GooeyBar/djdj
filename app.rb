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
  "#{playlist.name} : #{playlist.owner} : #{playlist.url_id} : #{playlist.users}"
end

post '/new' do
  owner = params[:owner]
  name = params[:name]
  users = JSON.parse(request.body.read)
  puts "???     " + users
  url_id = SecureRandom.hex(3)

  playlist = Playlist.new(owner: owner, name: name, url_id: url_id, users: users)
  counter = 10
  if playlist.save
    redirect "/#{url_id}"
  else
    until playlist.save || counter <= 0 do
      playlist.url_id = SecureRandom.hex(3)
      counter--
    end
    redirect "/#{url_id}"
  end
end
