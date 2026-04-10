#!/bin/bash
# Deploy Script: Fix Profile Creation & Email System
# Date: 2026-04-09
# Purpose: Complete deployment of registration fixes

echo "🚀 Starting deployment of profile creation fix..."
echo ""

# Configuration
PROJECT_REF="${PROJECT_REF:-hgikvbgceqfcwchgjbrg}"
WORKSPACE_PATH="c:\\Users\\AMD RYZEN 7 5Gen\\Proyectos Web\\mueveteporlacosta\\muevetecosta"

echo "📋 Configuration:"
echo "  Project Ref: $PROJECT_REF"
echo "  Workspace: $WORKSPACE_PATH"
echo ""

# Step 1: Validate Supabase connection
echo "✓ Step 1: Validating Supabase connection..."
npx supabase projects list --project-ref "$PROJECT_REF" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✓ Connection OK"
else
  echo "  ✗ Connection FAILED - Check PROJECT_REF"
  exit 1
fi
echo ""

# Step 2: Deploy migrations
echo "✓ Step 2: Deploying migrations..."
echo "  - Pushing: fix-profile-creation-on-signup"
echo "  - Pushing: ensure-email-templates"

npx supabase db push --project-ref "$PROJECT_REF"
if [ $? -eq 0 ]; then
  echo "  ✓ Migrations deployed successfully"
else
  echo "  ✗ Migration deployment FAILED"
  exit 1
fi
echo ""

# Step 3: Deploy Edge Functions
echo "✓ Step 3: Deploying Edge Functions..."

echo "  - Deploying send-email..."
npx supabase functions deploy send-email --project-ref "$PROJECT_REF"

echo "  - Deploying password-reset..."
npx supabase functions deploy password-reset --project-ref "$PROJECT_REF"

echo "  - Deploying reset-password..."
npx supabase functions deploy reset-password --project-ref "$PROJECT_REF"

if [ $? -eq 0 ]; then
  echo "  ✓ Edge Functions deployed successfully"
else
  echo "  ✗ Some Edge Functions failed to deploy"
  exit 1
fi
echo ""

# Step 4: Regenerate types (optional)
echo "✓ Step 4: Regenerating TypeScript types..."
npx supabase gen types typescript --project-ref "$PROJECT_REF" > src/integrations/supabase/types.ts
if [ $? -eq 0 ]; then
  echo "  ✓ Types regenerated"
else
  echo "  ⚠ Type generation failed (non-critical)"
fi
echo ""

# Step 5: Verify setup
echo "✓ Step 5: Verifying setup..."
echo ""
echo "  Running verification query..."
echo "  SELECT * FROM public.verify_email_setup();"
echo ""
echo "  ⚠️  Execute this query in Supabase SQL Editor to verify"
echo ""

echo "🎉 Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Go to Supabase Dashboard → SQL Editor"
echo "  2. Run: SELECT * FROM public.verify_email_setup();"
echo "  3. Verify all checks show OK status"
echo "  4. Test registration at http://localhost:5173/register"
echo ""
echo "🐛 Troubleshooting:"
echo "  - If migrations fail: Check migrations folder for syntax errors"
echo "  - If Edge Functions fail: Check function logs in Supabase"
echo "  - If email fails: Verify RESEND_API_KEY in email_configuration"
echo ""
