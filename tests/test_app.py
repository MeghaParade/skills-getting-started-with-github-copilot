import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Basketball Team" in data

def test_signup_and_unregister():
    activity = "Math Club"
    email = "testuser@mergington.edu"
    # Ensure not already signed up
    client.post(f"/activities/{activity}/unregister", params={"email": email})
    # Sign up
    response = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response.status_code == 200
    assert f"Signed up {email}" in response.json()["message"]
    # Duplicate signup should fail
    response2 = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response2.status_code == 400
    # Unregister
    response3 = client.post(f"/activities/{activity}/unregister", params={"email": email})
    assert response3.status_code == 200
    assert f"Unregistered {email}" in response3.json()["message"]
    # Unregister again should fail
    response4 = client.post(f"/activities/{activity}/unregister", params={"email": email})
    assert response4.status_code == 400

def test_signup_activity_not_found():
    response = client.post("/activities/Nonexistent/signup", params={"email": "nobody@mergington.edu"})
    assert response.status_code == 404

def test_unregister_activity_not_found():
    response = client.post("/activities/Nonexistent/unregister", params={"email": "nobody@mergington.edu"})
    assert response.status_code == 404
