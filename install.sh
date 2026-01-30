#!/bin/sh

# Strata CLI Installation Script
# This script installs the Strata CLI tool with all necessary prerequisites.
#
# Usage:
#   curl -fsSL https://strata.do/install.sh | sh
#
# Requirements:
#   - Ruby >= 3.4.4
#   - Git

set -e

# Configuration
REQUIRED_RUBY_VERSION="3.4.4"
GEM_NAME="strata-cli"
GEM_SOURCE="https://rubygems.org"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

# Print functions (using printf for POSIX compatibility)
print_header() {
  printf "\n%b━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%b\n" "${BOLD}${BLUE}" "${NC}"
  printf "%b  Strata CLI Installer%b\n" "${BOLD}${BLUE}" "${NC}"
  printf "%b━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%b\n\n" "${BOLD}${BLUE}" "${NC}"
}

print_step() {
  printf "%b[•]%b %s\n" "${CYAN}" "${NC}" "$1"
}

print_success() {
  printf "%b[✓]%b %s\n" "${GREEN}" "${NC}" "$1"
}

print_warning() {
  printf "%b[!]%b %s\n" "${YELLOW}" "${NC}" "$1"
}

print_error() {
  printf "%b[✗]%b %s\n" "${RED}" "${NC}" "$1"
}

print_info() {
  printf "%b[i]%b %s\n" "${BLUE}" "${NC}" "$1"
}

# Version comparison function
# Returns 0 if version1 >= version2, 1 otherwise
version_gte() {
  version1=$1
  version2=$2
  
  # Use sort -V for version comparison
  result=$(printf '%s\n' "$version2" "$version1" | sort -V | head -n1)
  if [ "$result" = "$version2" ]; then
    return 0
  else
    return 1
  fi
}

# Extract major.minor.patch from version string (handles versions like 3.4.4p1)
extract_version() {
  echo "$1" | grep -oE '^[0-9]+\.[0-9]+\.[0-9]+' | head -1
}

# Check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check Ruby installation
check_ruby() {
  print_step "Checking Ruby installation..."
  
  if ! command_exists ruby; then
    print_error "Ruby is not installed."
    echo ""
    print_info "Strata CLI requires Ruby ${REQUIRED_RUBY_VERSION} or higher."
    echo ""
    printf "  %bTo install Ruby, you can use one of the following methods:%b\n" "${BOLD}" "${NC}"
    echo ""
    printf "  %bUsing rbenv (recommended):%b\n" "${YELLOW}" "${NC}"
    echo "    brew install rbenv ruby-build"
    echo "    rbenv install ${REQUIRED_RUBY_VERSION}"
    echo "    rbenv global ${REQUIRED_RUBY_VERSION}"
    echo ""
    printf "  %bUsing asdf:%b\n" "${YELLOW}" "${NC}"
    echo "    asdf plugin add ruby"
    echo "    asdf install ruby ${REQUIRED_RUBY_VERSION}"
    echo "    asdf global ruby ${REQUIRED_RUBY_VERSION}"
    echo ""
    printf "  %bUsing RVM:%b\n" "${YELLOW}" "${NC}"
    echo "    curl -sSL https://get.rvm.io | bash -s stable"
    echo "    rvm install ${REQUIRED_RUBY_VERSION}"
    echo "    rvm use ${REQUIRED_RUBY_VERSION} --default"
    echo ""
    printf "  %bOn macOS (system Ruby is outdated):%b\n" "${YELLOW}" "${NC}"
    echo "    brew install ruby"
    echo ""
    printf "  %bOn Ubuntu/Debian:%b\n" "${YELLOW}" "${NC}"
    echo "    sudo apt update && sudo apt install ruby-full"
    echo ""
    print_info "After installing Ruby, please run this installer again."
    exit 1
  fi
  
  # Get installed Ruby version
  ruby_version_full=$(ruby --version | awk '{print $2}')
  ruby_version=$(extract_version "$ruby_version_full")
  
  if [ -z "$ruby_version" ]; then
    print_error "Could not determine Ruby version."
    exit 1
  fi
  
  print_info "Found Ruby version: ${ruby_version_full}"
  
  # Check if version meets requirements
  if ! version_gte "$ruby_version" "$REQUIRED_RUBY_VERSION"; then
    print_error "Ruby version ${ruby_version} is below the required version ${REQUIRED_RUBY_VERSION}."
    echo ""
    print_info "Please upgrade your Ruby installation to version ${REQUIRED_RUBY_VERSION} or higher."
    echo ""
    
    # Detect Ruby version manager
    if command_exists rbenv; then
      printf "  %bYou appear to be using rbenv. To upgrade:%b\n" "${BOLD}" "${NC}"
      echo "    rbenv install ${REQUIRED_RUBY_VERSION}"
      echo "    rbenv global ${REQUIRED_RUBY_VERSION}"
      echo "    rbenv rehash"
    elif command_exists asdf && asdf plugin list 2>/dev/null | grep -q ruby; then
      printf "  %bYou appear to be using asdf. To upgrade:%b\n" "${BOLD}" "${NC}"
      echo "    asdf install ruby ${REQUIRED_RUBY_VERSION}"
      echo "    asdf global ruby ${REQUIRED_RUBY_VERSION}"
    elif command_exists rvm; then
      printf "  %bYou appear to be using RVM. To upgrade:%b\n" "${BOLD}" "${NC}"
      echo "    rvm install ${REQUIRED_RUBY_VERSION}"
      echo "    rvm use ${REQUIRED_RUBY_VERSION} --default"
    else
      printf "  %bTo upgrade Ruby, consider using a version manager:%b\n" "${BOLD}" "${NC}"
      echo ""
      printf "  %brbenv (recommended):%b\n" "${YELLOW}" "${NC}"
      echo "    brew install rbenv ruby-build"
      echo "    rbenv install ${REQUIRED_RUBY_VERSION}"
      echo "    rbenv global ${REQUIRED_RUBY_VERSION}"
    fi
    echo ""
    print_info "After upgrading Ruby, please run this installer again."
    exit 1
  fi
  
  print_success "Ruby ${ruby_version} meets requirements (>= ${REQUIRED_RUBY_VERSION})"
}

# Check Git installation
check_git() {
  print_step "Checking Git installation..."
  
  if ! command_exists git; then
    print_error "Git is not installed."
    echo ""
    print_info "Strata CLI requires Git for project management."
    echo ""
    printf "  %bTo install Git:%b\n" "${BOLD}" "${NC}"
    echo ""
    printf "  %bOn macOS:%b\n" "${YELLOW}" "${NC}"
    echo "    brew install git"
    echo "    # or"
    echo "    xcode-select --install"
    echo ""
    printf "  %bOn Ubuntu/Debian:%b\n" "${YELLOW}" "${NC}"
    echo "    sudo apt update && sudo apt install git"
    echo ""
    printf "  %bOn Fedora:%b\n" "${YELLOW}" "${NC}"
    echo "    sudo dnf install git"
    echo ""
    printf "  %bOn Windows:%b\n" "${YELLOW}" "${NC}"
    echo "    Download from https://git-scm.com/download/win"
    echo ""
    print_info "After installing Git, please run this installer again."
    exit 1
  fi
  
  git_version=$(git --version | awk '{print $3}')
  print_success "Git ${git_version} is installed"
}

# Check if gem is already installed
check_existing_installation() {
  print_step "Checking for existing Strata CLI installation..."
  
  if gem list -i "^${GEM_NAME}$" >/dev/null 2>&1; then
    installed_version=$(gem list "${GEM_NAME}" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+[^)]*' | head -1)
    print_warning "Strata CLI is already installed (version ${installed_version})"
    echo ""
    
    # Ask user if they want to reinstall/upgrade
    printf "Do you want to reinstall/upgrade? [y/N] "
    read -r response
    case "$response" in
      [yY][eE][sS]|[yY])
        print_info "Proceeding with reinstallation..."
        return 1
        ;;
      *)
        print_info "Keeping existing installation."
        echo ""
        print_success "Strata CLI is ready to use!"
        echo ""
        printf "  Run %bstrata --help%b to get started.\n" "${BOLD}" "${NC}"
        echo ""
        exit 0
        ;;
    esac
  fi
  
  return 1
}

# Install the gem
install_gem() {
  print_step "Installing Strata CLI..."
  echo ""
  
  # Check if user has write permissions to gem directory
  gem_dir=$(gem environment gemdir 2>/dev/null)
  
  if [ -n "$gem_dir" ] && [ ! -w "$gem_dir" ]; then
    print_warning "Installing to system gem directory requires sudo."
    print_info "Consider using a Ruby version manager (rbenv, asdf, rvm) for user-level installations."
    echo ""
    
    if sudo gem install "${GEM_NAME}" --source "${GEM_SOURCE}"; then
      print_success "Strata CLI installed successfully!"
    else
      print_error "Failed to install Strata CLI."
      echo ""
      print_info "Please check the error message above and try again."
      exit 1
    fi
  else
    if gem install "${GEM_NAME}" --source "${GEM_SOURCE}"; then
      print_success "Strata CLI installed successfully!"
    else
      print_error "Failed to install Strata CLI."
      echo ""
      print_info "Please check the error message above and try again."
      exit 1
    fi
  fi
}

# Verify installation
verify_installation() {
  print_step "Verifying installation..."
  
  # Refresh gem paths
  if command_exists rbenv; then
    rbenv rehash 2>/dev/null || true
  fi
  
  if command_exists strata; then
    installed_version=$(strata version 2>/dev/null || strata --version 2>/dev/null || echo "unknown")
    print_success "Strata CLI is now available (${installed_version})"
  else
    print_warning "Installation completed, but 'strata' command not found in PATH."
    echo ""
    print_info "You may need to:"
    echo "  1. Open a new terminal window, or"
    echo "  2. Run: source ~/.bashrc (or ~/.zshrc)"
    echo ""
    
    # Try to find where the gem was installed
    gem_bin=$(gem environment | grep "EXECUTABLE DIRECTORY" | awk -F': ' '{print $2}')
    if [ -n "$gem_bin" ]; then
      print_info "The strata command should be at: ${gem_bin}/strata"
      echo ""
      echo "  If it's not in your PATH, add this to your shell profile:"
      echo "    export PATH=\"${gem_bin}:\$PATH\""
    fi
  fi
}

# Print completion message
print_completion() {
  echo ""
  printf "%b━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%b\n" "${BOLD}${GREEN}" "${NC}"
  printf "%b  Installation Complete!%b\n" "${BOLD}${GREEN}" "${NC}"
  printf "%b━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%b\n" "${BOLD}${GREEN}" "${NC}"
  echo ""
  printf "  %bGetting Started:%b\n" "${BOLD}" "${NC}"
  echo ""
  echo "    strata --help          Show available commands"
  echo "    strata init            Initialize a new Strata project"
  echo "    strata datasource add  Add a datasource connection"
  echo ""
  printf "  %bDocumentation:%b\n" "${BOLD}" "${NC}"
  echo ""
  echo "    https://docs.strata.site"
  echo ""
}

# Main installation flow
main() {
  print_header
  
  # Run prerequisite checks
  check_ruby
  check_git
  
  echo ""
  
  # Check for existing installation
  check_existing_installation
  
  # Install the gem
  install_gem
  
  # Verify installation
  verify_installation
  
  # Print completion message
  print_completion
}

# Run main function
main "$@"
