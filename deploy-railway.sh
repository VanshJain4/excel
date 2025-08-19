#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Railway Deployment Script${NC}"
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Git repository not found. Please initialize git first.${NC}"
    exit 1
fi

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📋 Current branch: ${CURRENT_BRANCH}${NC}"

# Check if all required files exist
echo -e "${BLUE}🔍 Checking required files...${NC}"

REQUIRED_FILES=("railway.json" "Dockerfile" "railway-server.js" "package.json")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file (missing)${NC}"
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required files. Please create them first.${NC}"
    exit 1
fi

# Check if we have uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes.${NC}"
    echo -e "${BLUE}📝 Current changes:${NC}"
    git status --short
    
    read -p "Do you want to commit these changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Prepare for Railway deployment"
        echo -e "${GREEN}✅ Changes committed${NC}"
    else
        echo -e "${YELLOW}⚠️  Please commit your changes before deploying${NC}"
        exit 1
    fi
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo -e "${RED}❌ No remote origin found. Please add your GitHub repository:${NC}"
    echo "   git remote add origin https://github.com/yourusername/yourrepo.git"
    exit 1
fi

# Push to remote
echo -e "${BLUE}📤 Pushing to remote repository...${NC}"
git push origin $CURRENT_BRANCH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Code pushed successfully${NC}"
else
    echo -e "${RED}❌ Failed to push code${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Ready for Railway deployment!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Go to https://railway.app/dashboard"
echo "2. Click 'New Project'"
echo "3. Choose 'Deploy from GitHub repo'"
echo "4. Select your repository"
echo "5. Configure environment variables (see RAILWAY_DEPLOYMENT.md)"
echo ""
echo -e "${YELLOW}💡 Don't forget to:${NC}"
echo "- Set up MongoDB Atlas"
echo "- Configure environment variables"
echo "- Test your deployment"
echo ""
echo -e "${BLUE}📚 For detailed instructions, see: RAILWAY_DEPLOYMENT.md${NC}" 