require 'sinatra'
require 'sinatra/activerecord'
require './config/environments'

get '/' do
  "foo"
end

get '/new' do
  erb :new
end

post '/new' do

end
