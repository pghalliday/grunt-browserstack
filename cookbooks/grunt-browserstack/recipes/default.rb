include_recipe "nodejs"
include_recipe "java"
include_recipe "rbenv::default"
include_recipe "rbenv::ruby_build"

rbenv_ruby "2.0.0-p247"
rbenv_gem "travis" do
  ruby_version "2.0.0-p247"
end

bash "install and test" do
  code <<-EOH
    su -l vagrant -c "cd /vagrant && npm install && npm test"
  EOH
end