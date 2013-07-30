# dependency defaults
default[:nodejs][:install_method] = "package"

# rbenv overrides to avoid git urls (which are often blocked by corporate firewalls)
default[:rbenv][:git_repository]      = "https://github.com/sstephenson/rbenv.git"
default[:ruby_build][:git_repository] = "https://github.com/sstephenson/ruby-build.git"
default[:rbenv_vars][:git_repository] = "https://github.com/sstephenson/rbenv-vars.git"
