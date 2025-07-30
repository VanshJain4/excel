# 🆓 Free OpenAI API Setup Guide

## Step 1: Get Free Account
1. Go to https://platform.openai.com/
2. Click **"Sign Up"**
3. Create account (no credit card required)
4. **Get $5 free credits** (valid for 3 months)

## Step 2: Create API Key
1. After login, go to **API Keys** section
2. Click **"Create new secret key"**
3. Name: "Excel Cursor"
4. **Copy the key** (starts with `sk-`)

## Step 3: Add to Project
Create a `.env` file in your project root:
```bash
echo "OPENAI_API_KEY=sk-your-actual-key-here" > .env
```

## Step 4: Test
Restart your servers and you'll see:
```
✅ OpenAI API key found. Using real AI responses.
```

## 💰 Cost Info
- **Free tier**: $5 credits (3 months)
- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **Typical usage**: Very low cost
- **After free tier**: Pay-as-you-go

## 🔒 Security
- Never commit `.env` to git
- Keep your API key private
- The `.env` file is already in `.gitignore` 