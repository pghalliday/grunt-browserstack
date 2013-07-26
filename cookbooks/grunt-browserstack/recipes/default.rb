include_recipe "nodejs"
include_recipe "java"

bash "install and test" do
  code <<-EOH
    su -l vagrant -c "cd /vagrant && npm install && npm test"
  EOH
end