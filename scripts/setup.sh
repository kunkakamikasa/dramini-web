#!/bin/bash

# Dramini Setup Script
echo "🎬 Setting up Dramini - Vertical Short Drama Platform"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env.local from example
if [ ! -f .env.local ]; then
    echo "🔧 Creating .env.local from template..."
    cp env.example .env.local
    echo "✅ .env.local created. Please edit it with your configuration."
else
    echo "⚠️  .env.local already exists. Skipping creation."
fi

# Create public directories
echo "📁 Creating public directories..."
mkdir -p public/posters
echo "✅ Public directories created"

# Run type check
echo "🔍 Running type check..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  Type check found some issues. Please review them."
else
    echo "✅ Type check passed"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Edit .env.local with your configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more information, see README.md"
echo "🆘 For support, contact the development team"
echo ""
echo "Happy coding! 🚀"

