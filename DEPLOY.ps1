# Deploy Script: Fix Profile Creation & Email System (Windows PowerShell)
# Date: 2026-04-09
# Usage: .\DEPLOY.ps1

$ErrorActionPreference = "Stop"

# Configuration
$PROJECT_REF = "hgikvbgceqfcwchgjbrg"
$WORKSPACE_PATH = "c:\Users\AMD RYZEN 7 5Gen\Proyectos Web\mueveteporlacosta\muevetecosta"

# Colors for output
$Success = "Green"
$Error = "Red"
$Warning = "Yellow"
$Info = "Cyan"

Write-Host "🚀 Starting deployment of profile creation fix..." -ForegroundColor $Info
Write-Host ""

Write-Host "📋 Configuration:" -ForegroundColor $Info
Write-Host "  Project Ref: $PROJECT_REF"
Write-Host "  Workspace: $WORKSPACE_PATH"
Write-Host ""

# Change to workspace
try {
    Set-Location $WORKSPACE_PATH
    Write-Host "✓ Changed to workspace directory" -ForegroundColor $Success
}
catch {
    Write-Host "✗ Failed to change directory to workspace" -ForegroundColor $Error
    exit 1
}
Write-Host ""

# Step 1: Validate Supabase connection
Write-Host "✓ Step 1: Validating Supabase connection..." -ForegroundColor $Info
try {
    npx supabase projects list --project-ref $PROJECT_REF | Out-Null
    Write-Host "  ✓ Connection OK" -ForegroundColor $Success
}
catch {
    Write-Host "  ✗ Connection FAILED - Check PROJECT_REF" -ForegroundColor $Error
    exit 1
}
Write-Host ""

# Step 2: Deploy migrations
Write-Host "✓ Step 2: Deploying migrations..." -ForegroundColor $Info
Write-Host "  Pushing migrations:"
Write-Host "    - 20260409000000-fix-profile-creation-on-signup.sql"
Write-Host "    - 20260409000001-ensure-email-templates.sql"
Write-Host ""

try {
    npx supabase db push --project-ref $PROJECT_REF
    Write-Host "  ✓ Migrations deployed successfully" -ForegroundColor $Success
}
catch {
    Write-Host "  ✗ Migration deployment FAILED" -ForegroundColor $Error
    Write-Host "  Error: $_" -ForegroundColor $Error
    exit 1
}
Write-Host ""

# Step 3: Deploy Edge Functions
Write-Host "✓ Step 3: Deploying Edge Functions..." -ForegroundColor $Info

Write-Host "  Deploying send-email..." -ForegroundColor $Info
try {
    npx supabase functions deploy send-email --project-ref $PROJECT_REF
    Write-Host "    ✓ Deployed" -ForegroundColor $Success
}
catch {
    Write-Host "    ⚠ Failed (check manually)" -ForegroundColor $Warning
}

Write-Host "  Deploying password-reset..." -ForegroundColor $Info
try {
    npx supabase functions deploy password-reset --project-ref $PROJECT_REF
    Write-Host "    ✓ Deployed" -ForegroundColor $Success
}
catch {
    Write-Host "    ⚠ Failed (check manually)" -ForegroundColor $Warning
}

Write-Host "  Deploying reset-password..." -ForegroundColor $Info
try {
    npx supabase functions deploy reset-password --project-ref $PROJECT_REF
    Write-Host "    ✓ Deployed" -ForegroundColor $Success
}
catch {
    Write-Host "    ⚠ Failed (check manually)" -ForegroundColor $Warning
}

Write-Host "  ✓ Edge Functions deployment completed" -ForegroundColor $Success
Write-Host ""

# Step 4: Regenerate types (optional)
Write-Host "✓ Step 4: Regenerating TypeScript types..." -ForegroundColor $Info
try {
    $types = npx supabase gen types typescript --project-ref $PROJECT_REF
    $types | Out-File -FilePath "src/integrations/supabase/types.ts" -Encoding UTF8
    Write-Host "  ✓ Types regenerated" -ForegroundColor $Success
}
catch {
    Write-Host "  ⚠ Type generation failed (non-critical)" -ForegroundColor $Warning
}
Write-Host ""

# Step 5: Summary
Write-Host "🎉 Deployment complete!" -ForegroundColor $Success
Write-Host ""

Write-Host "📝 Next steps:" -ForegroundColor $Info
Write-Host "  1. Go to Supabase Dashboard"
Write-Host "  2. Navigate to SQL Editor"
Write-Host "  3. Copy and run this query:" -ForegroundColor $Warning
Write-Host ""
Write-Host "     SELECT * FROM public.verify_email_setup();" -ForegroundColor $Warning
Write-Host ""
Write-Host "  4. Verify all checks show 'OK' status"
Write-Host "  5. Test registration at http://localhost:5173/register"
Write-Host ""

Write-Host "🧪 Testing:" -ForegroundColor $Info
Write-Host "  1. If dev server is not running, start it:"
Write-Host ""
Write-Host "     npm run dev" -ForegroundColor $Warning
Write-Host ""
Write-Host "  2. Register a new student account"
Write-Host "  3. Check that profile was created in Supabase"
Write-Host "  4. Check that email was logged in email_history table"
Write-Host ""

Write-Host "🐛 Troubleshooting:" -ForegroundColor $Warning
Write-Host "  - If migrations fail: Check supabase/migrations folder"
Write-Host "  - If Edge Functions fail: Run individually and check logs"
Write-Host "  - If email fails: Verify RESEND_API_KEY in email_configuration"
Write-Host "  - If profile still missing: Run create_missing_profile() RPC"
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor $Info
Write-Host "  - FIX_PROFILE_CREATION_GUIDE.md (complete guide)"
Write-Host "  - ARCHITECTURE.md (system design)"
Write-Host "  - IMPLEMENTATION_CHECKLIST.md (verification checklist)"
Write-Host ""
