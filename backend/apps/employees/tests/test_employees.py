import pytest
from rest_framework import status
from model_bakery import baker
from datetime import date

pytestmark = pytest.mark.django_db


class TestEmployeeAPI:
    def test_list_employees(self, auth_client):
        baker.make("employees.Employee", name="Test Employee", role="cashier")
        resp = auth_client.get("/api/v1/employees/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] >= 1

    def test_create_employee(self, auth_client):
        data = {"name": "John Doe", "role": "cashier", "hire_date": date.today().isoformat()}
        resp = auth_client.post("/api/v1/employees/", data)
        assert resp.status_code == status.HTTP_201_CREATED

    def test_clock_in(self, auth_client):
        emp = baker.make("employees.Employee", name="Test", role="cashier")
        resp = auth_client.post("/api/v1/employees/attendance/clock_in/", {"employee_id": str(emp.id)})
        assert resp.status_code == status.HTTP_200_OK

    def test_clock_out(self, auth_client):
        emp = baker.make("employees.Employee", name="Test", role="cashier")
        baker.make("employees.Attendance", employee=emp, date=date.today(), time_in="09:00:00")
        resp = auth_client.post("/api/v1/employees/attendance/clock_out/", {"employee_id": str(emp.id)})
        assert resp.status_code == status.HTTP_200_OK
