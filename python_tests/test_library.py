import pytest
import requests

# LibOrbit API Base URL (Change to your Render URL if testing the live deployment)
BASE_URL = "https://library-management-lwz9.onrender.com/api"

# Global test data for a consistent testing environment
test_user = {
    "name": "Test Student",
    "email": "teststudent_99@pdpu.ac.in",
    "password": "SecurePassword123!",
    "role": "student"
}
auth_token = None

def test_user_registration_success():
    """Test Case 1: Verify a new student can register successfully."""
    # This checks the logic in backend/controllers/authController.js
    response = requests.post(f"{BASE_URL}/auth/register", json=test_user)
    # Success returns 201; if already exists from previous runs, 400 is expected logic
    assert response.status_code in [201, 400]

def test_duplicate_email_registration():
    """Test Case 2: Verify system rejects registration with an existing email."""
    # Logic: Should trigger the existing email check in the database
    response = requests.post(f"{BASE_URL}/auth/register", json=test_user)
    assert response.status_code == 400
    # Checks if the server response contains our expected error message
    assert "already exist" in response.text.lower() or "duplicate" in response.text.lower()

def test_user_login_success():
    """Test Case 3: Verify user can log in and receive a JWT token."""
    global auth_token
    credentials = {
        "email": test_user["email"],
        "password": test_user["password"]
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=credentials)
    
    assert response.status_code == 200
    data = response.json()
    
    # Logic: Ensure a token is generated for session management
    assert "token" in data
    auth_token = data["token"]

def test_unauthorized_access_protection():
    """Test Case 4: Verify protected routes reject requests without a JWT token."""
    # Logic: auth.js middleware should block requests missing a proper Bearer token
    headers = {"Authorization": "Bearer "}
    
    response = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)
    
    # Backend logic should return 401 (Unauthorized) or 403 (Forbidden)
    assert response.status_code in [401, 403]

def test_fetch_dashboard_stats():
    """Test Case 5: Verify the API returns valid dashboard stats for the authenticated user."""
    global auth_token
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    response = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    # Check that our updated dashboard logic is returning the correct keys
    assert "totalIssued" in data
    assert "totalHistory" in data

def test_fetch_books_catalog():
    """Test Case 6: Verify the API successfully returns the library book catalog."""
    global auth_token
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    response = requests.get(f"{BASE_URL}/books", headers=headers)
    assert response.status_code == 200
    
    # Check if the database query successfully returned an array/list of books
    assert isinstance(response.json(), list)

def test_submit_book_request():
    """Test Case 7: Verify a student can submit a custom book request to the admins."""
    global auth_token
    headers = {"Authorization": f"Bearer {auth_token}"}
    request_data = {
        "title": "Introduction to Algorithms",
        "author": "Thomas H. Cormen",
        "reason": "Required for 5th semester syllabus."
    }
    
    response = requests.post(f"{BASE_URL}/requests/custom", json=request_data, headers=headers)
    # Depending on how you wrote the response status in requestController.js, it will be 200 or 201
    assert response.status_code in [200, 201]

# Execution Command: 
# pytest test_liborbit.py -v