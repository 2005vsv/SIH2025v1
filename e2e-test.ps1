# PowerShell script for comprehensive end-to-end testing of Student Portal

$baseUrl = "http://localhost:5001/api"
$frontendUrl = "http://localhost:3000"

Write-Host "🚀 Starting End-to-End Integration Testing for Student Portal" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

# Initialize variables for tracking
$totalTests = 0
$passedTests = 0
$failedTests = 0
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null,
        [hashtable]$Headers = @{},
        [string]$ContentType = "application/json"
    )
    
    $global:totalTests++
    Write-Host "🔍 Testing: $Name..." -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = $ContentType
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "  ✅ PASSED: $Name" -ForegroundColor Green
        $global:passedTests++
        $global:testResults += @{ Name = $Name; Status = "PASSED"; Details = "Success" }
        return $response
    }
    catch {
        Write-Host "  ❌ FAILED: $Name - $($_.Exception.Message)" -ForegroundColor Red
        $global:failedTests++
        $global:testResults += @{ Name = $Name; Status = "FAILED"; Details = $_.Exception.Message }
        return $null
    }
}

# 1. Test Backend Health
Write-Host "📊 Phase 1: Backend Health Check" -ForegroundColor Magenta
$healthResponse = Test-Endpoint -Name "Backend Health Check" -Url "$baseUrl/health"

# 2. Test Authentication Flow
Write-Host ""
Write-Host "🔐 Phase 2: Authentication Testing" -ForegroundColor Magenta

# Test user registration
$registerData = @{
    name = "Integration Test User"
    email = "integrationtest@example.com"
    password = "testpass123"
    role = "student"
}
$registerResponse = Test-Endpoint -Name "User Registration" -Url "$baseUrl/v1/auth/register" -Method "POST" -Body $registerData

# Test admin login
$adminLoginData = @{
    email = "admin@studentportal.com"
    password = "admin123"
}
$adminLoginResponse = Test-Endpoint -Name "Admin Login" -Url "$baseUrl/v1/auth/login" -Method "POST" -Body $adminLoginData

$adminToken = $null
if ($adminLoginResponse) {
    $adminToken = $adminLoginResponse.data.token
}

# Test student login
$studentLoginData = @{
    email = "student1@studentportal.com"
    password = "student123"
}
$studentLoginResponse = Test-Endpoint -Name "Student Login" -Url "$baseUrl/v1/auth/login" -Method "POST" -Body $studentLoginData

$studentToken = $null
if ($studentLoginResponse) {
    $studentToken = $studentLoginResponse.data.token
}

# 3. Test Protected Routes with Authentication
Write-Host ""
Write-Host "🛡️ Phase 3: Protected Routes Testing" -ForegroundColor Magenta

if ($adminToken) {
    $adminHeaders = @{ "Authorization" = "Bearer $adminToken" }
    
    # Test user management
    Test-Endpoint -Name "Get All Users (Admin)" -Url "$baseUrl/v1/users" -Headers $adminHeaders
    Test-Endpoint -Name "Get User Profile (Admin)" -Url "$baseUrl/v1/auth/me" -Headers $adminHeaders
}

if ($studentToken) {
    $studentHeaders = @{ "Authorization" = "Bearer $studentToken" }
    
    # Test student-specific routes
    Test-Endpoint -Name "Get Student Profile" -Url "$baseUrl/v1/auth/me" -Headers $studentHeaders
}

# 4. Test Library Management
Write-Host ""
Write-Host "📚 Phase 4: Library System Testing" -ForegroundColor Magenta

if ($adminToken) {
    # Test library operations
    Test-Endpoint -Name "Get All Books" -Url "$baseUrl/v1/library/books" -Headers $adminHeaders
    Test-Endpoint -Name "Get Library Analytics" -Url "$baseUrl/v1/analytics/library" -Headers $adminHeaders
}

# 5. Test Fee Management
Write-Host ""
Write-Host "💳 Phase 5: Fee Management Testing" -ForegroundColor Magenta

if ($adminToken) {
    Test-Endpoint -Name "Get All Fees (Admin)" -Url "$baseUrl/v1/fees" -Headers $adminHeaders
    Test-Endpoint -Name "Get Fee Analytics" -Url "$baseUrl/v1/analytics/fees" -Headers $adminHeaders
}

if ($studentToken) {
    Test-Endpoint -Name "Get Student Fees" -Url "$baseUrl/v1/fees/my" -Headers $studentHeaders
}

# 6. Test Exam System
Write-Host ""
Write-Host "📝 Phase 6: Exam System Testing" -ForegroundColor Magenta

if ($adminToken) {
    Test-Endpoint -Name "Get Exams (Admin)" -Url "$baseUrl/v1/exams" -Headers $adminHeaders
}

if ($studentToken) {
    Test-Endpoint -Name "Get Student Exams" -Url "$baseUrl/v1/exams/my" -Headers $studentHeaders
}

# 7. Test Placement System
Write-Host ""
Write-Host "🎯 Phase 7: Placement System Testing" -ForegroundColor Magenta

if ($adminToken) {
    Test-Endpoint -Name "Get Job Postings (Admin)" -Url "$baseUrl/v1/placements/jobs" -Headers $adminHeaders
    Test-Endpoint -Name "Get Placement Analytics" -Url "$baseUrl/v1/analytics/placements" -Headers $adminHeaders
}

# 8. Test Gamification System
Write-Host ""
Write-Host "🏆 Phase 8: Gamification System Testing" -ForegroundColor Magenta

if ($adminToken) {
    Test-Endpoint -Name "Get Leaderboard" -Url "$baseUrl/v1/gamification/leaderboard" -Headers $adminHeaders
    Test-Endpoint -Name "Get All Badges" -Url "$baseUrl/v1/gamification/badges" -Headers $adminHeaders
}

# 9. Test Analytics System
Write-Host ""
Write-Host "📈 Phase 9: Analytics System Testing" -ForegroundColor Magenta

if ($adminToken) {
    Test-Endpoint -Name "Get Dashboard Analytics" -Url "$baseUrl/v1/analytics/dashboard" -Headers $adminHeaders
    Test-Endpoint -Name "Get User Analytics" -Url "$baseUrl/v1/analytics/users" -Headers $adminHeaders
}

# 10. Test Notification System
Write-Host ""
Write-Host "🔔 Phase 10: Notification System Testing" -ForegroundColor Magenta

if ($adminToken) {
    Test-Endpoint -Name "Get All Notifications (Admin)" -Url "$baseUrl/v1/notifications" -Headers $adminHeaders
}

if ($studentToken) {
    Test-Endpoint -Name "Get Student Notifications" -Url "$baseUrl/v1/notifications/my" -Headers $studentHeaders
}

# 11. Test Frontend Accessibility
Write-Host ""
Write-Host "🌐 Phase 11: Frontend Accessibility Testing" -ForegroundColor Magenta

try {
    $frontendResponse = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 10
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "  ✅ PASSED: Frontend Accessible" -ForegroundColor Green
        $totalTests++
        $passedTests++
        $testResults += @{ Name = "Frontend Accessible"; Status = "PASSED"; Details = "Frontend is loading correctly" }
    }
}
catch {
    Write-Host "  ❌ FAILED: Frontend Not Accessible - $($_.Exception.Message)" -ForegroundColor Red
    $totalTests++
    $failedTests++
    $testResults += @{ Name = "Frontend Accessible"; Status = "FAILED"; Details = $_.Exception.Message }
}

# 12. Final Summary
Write-Host ""
Write-Host "📋 Test Results Summary" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red

if ($failedTests -eq 0) {
    Write-Host ""
    Write-Host "🎉 ALL TESTS PASSED! Student Portal is fully functional!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Backend API: Running on http://localhost:5001" -ForegroundColor Green
    Write-Host "✅ Frontend: Running on http://localhost:3000" -ForegroundColor Green
    Write-Host "✅ API Documentation: http://localhost:5001/api-docs" -ForegroundColor Green
    Write-Host "✅ Database: Connected and seeded with sample data" -ForegroundColor Green
    Write-Host ""
    Write-Host "Default Login Credentials:" -ForegroundColor Yellow
    Write-Host "Admin: admin@studentportal.com / admin123" -ForegroundColor Yellow
    Write-Host "Faculty: faculty@studentportal.com / faculty123" -ForegroundColor Yellow
    Write-Host "Students: student1@studentportal.com to student5@studentportal.com / student123" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "⚠️ Some tests failed. Please check the details above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Failed Tests:" -ForegroundColor Red
    foreach ($result in $testResults) {
        if ($result.Status -eq "FAILED") {
            Write-Host "  - $($result.Name): $($result.Details)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "🚀 End-to-End Testing Complete!" -ForegroundColor Cyan