# PowerShell script to test Student Portal API endpoints

$baseUrl = "http://localhost:5001/api"

Write-Host "🔍 Testing Student Portal API..." -ForegroundColor Cyan
Write-Host ""

# Test Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✅ Health Check: " -ForegroundColor Green -NoNewline
    Write-Host ($healthResponse | ConvertTo-Json) -ForegroundColor White
} catch {
    Write-Host "❌ Health Check Failed: " -ForegroundColor Red -NoNewline
    Write-Host $_.Exception.Message -ForegroundColor White
}
Write-Host ""

# Test User Registration
Write-Host "2. Testing User Registration..." -ForegroundColor Yellow
$registerData = @{
    name = "Test User"
    email = "testuser@example.com"
    password = "testpass123"
    role = "student"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/v1/auth/register" -Method Post -Body $registerData -ContentType "application/json"
    Write-Host "✅ Registration: " -ForegroundColor Green -NoNewline
    Write-Host ($registerResponse | ConvertTo-Json) -ForegroundColor White
} catch {
    Write-Host "❌ Registration Failed: " -ForegroundColor Red -NoNewline
    Write-Host $_.Exception.Message -ForegroundColor White
}
Write-Host ""

# Test User Login
Write-Host "3. Testing User Login..." -ForegroundColor Yellow
$loginData = @{
    email = "admin@studentportal.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/v1/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login: " -ForegroundColor Green -NoNewline
    Write-Host ($loginResponse | ConvertTo-Json -Depth 3) -ForegroundColor White
    $token = $loginResponse.data.token
} catch {
    Write-Host "❌ Login Failed: " -ForegroundColor Red -NoNewline
    Write-Host $_.Exception.Message -ForegroundColor White
}
Write-Host ""

# Test Protected Route (Get Users)
if ($token) {
    Write-Host "4. Testing Protected Route (Get Users)..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    try {
        $usersResponse = Invoke-RestMethod -Uri "$baseUrl/v1/users" -Method Get -Headers $headers
        Write-Host "✅ Get Users: " -ForegroundColor Green -NoNewline
        Write-Host "Found $($usersResponse.data.data.Count) users" -ForegroundColor White
    } catch {
        Write-Host "❌ Get Users Failed: " -ForegroundColor Red -NoNewline
        Write-Host $_.Exception.Message -ForegroundColor White
    }
    Write-Host ""

    # Test Get Books
    Write-Host "5. Testing Get Books..." -ForegroundColor Yellow
    try {
        $booksResponse = Invoke-RestMethod -Uri "$baseUrl/v1/library/books" -Method Get -Headers $headers
        Write-Host "✅ Get Books: " -ForegroundColor Green -NoNewline
        Write-Host "Found $($booksResponse.data.data.Count) books" -ForegroundColor White
    } catch {
        Write-Host "❌ Get Books Failed: " -ForegroundColor Red -NoNewline
        Write-Host $_.Exception.Message -ForegroundColor White
    }
    Write-Host ""

    # Test Get Fees
    Write-Host "6. Testing Get Fees..." -ForegroundColor Yellow
    try {
        $feesResponse = Invoke-RestMethod -Uri "$baseUrl/v1/fees" -Method Get -Headers $headers
        Write-Host "✅ Get Fees: " -ForegroundColor Green -NoNewline
        Write-Host "Found $($feesResponse.data.data.Count) fees" -ForegroundColor White
    } catch {
        Write-Host "❌ Get Fees Failed: " -ForegroundColor Red -NoNewline
        Write-Host $_.Exception.Message -ForegroundColor White
    }
    Write-Host ""
}

Write-Host "🎉 API Testing Complete!" -ForegroundColor Cyan
Write-Host "📚 Full API Documentation: http://localhost:5001/api-docs" -ForegroundColor Blue