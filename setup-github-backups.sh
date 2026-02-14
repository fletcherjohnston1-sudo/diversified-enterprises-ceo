#!/bin/bash
# Setup GitHub backups for all Diversified Enterprises workspaces
# Run this after creating the GitHub repos

# GitHub username
GITHUB_USER="fletcherjohnston1-sudo"

# Personal access token (classic) with repo scope
# Get from: https://github.com/settings/tokens
read -sp "Enter your GitHub Personal Access Token: " GITHUB_TOKEN
echo

# Repo names to create on GitHub (must create these manually first or via gh CLI)
REPOS=(
  "diversified-enterprises-ceo"
  "diversified-enterprises-cto"
  "diversified-enterprises-cfo"
  "diversified-enterprises-chief"
  "diversified-enterprises-research"
)

# Set up git remotes and push
for repo in "${REPOS[@]}"; do
  workspace="${repo#diversified-enterprises-}"
  workspace_path="$HOME/.openclaw/workspace-${workspace}"
  
  echo "Setting up ${workspace} workspace..."
  
  cd "$workspace_path" || continue
  
  # Add remote
  git remote add origin "https://${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${repo}.git"
  
  # Rename branch to main
  git branch -M main
  
  # Push
  git push -u origin main
  
  echo "✅ ${workspace} workspace backed up to GitHub"
done

echo ""
echo "All workspaces configured for GitHub backup!"
echo "The git-auto-sync cron will now back up workspace-ceo daily."
echo "To backup other workspaces, you'll need to update the cron job."
