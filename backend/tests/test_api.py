import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "online"

def test_dashboard_stats():
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200
    data = res.json()
    assert "total_employees" in data
    assert "active_employees" in data
    assert "department_distribution" in data
    assert data["total_employees"] >= 15

def test_departments_crud():
    # 1. List
    res = client.get("/api/departments")
    assert res.status_code == 200
    depts = res.json()
    assert len(depts) >= 5

    # 2. Create
    new_dept = {
        "name": "Quality Assurance & Testing",
        "description": "Enterprise QA and automated testing pipelines",
        "head_name": "Valerie Croft"
    }
    create_res = client.post("/api/departments", json=new_dept)
    assert create_res.status_code == 201
    created = create_res.json()
    dept_id = created["id"]
    assert created["name"] == "Quality Assurance & Testing"

    # 3. Update
    upd_res = client.put(f"/api/departments/{dept_id}", json={"head_name": "Valerie Croft-Perez"})
    assert upd_res.status_code == 200
    assert upd_res.json()["head_name"] == "Valerie Croft-Perez"

    # 4. Get by ID
    get_res = client.get(f"/api/departments/{dept_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Quality Assurance & Testing"

    # 5. Delete
    del_res = client.delete(f"/api/departments/{dept_id}")
    assert del_res.status_code == 200

def test_designations_crud():
    # Get a department id
    depts = client.get("/api/departments").json()
    dept_id = depts[0]["id"]

    # 1. Create designation
    new_desig = {
        "title": "Cloud Security Specialist",
        "department_id": dept_id,
        "description": "Oversees IAM, zero-trust and compliance",
        "salary_grade": "L3 - Specialist",
        "min_salary": 90000,
        "max_salary": 130000
    }
    c_res = client.post("/api/designations", json=new_desig)
    assert c_res.status_code == 201
    desig_id = c_res.json()["id"]

    # 2. Update designation
    u_res = client.put(f"/api/designations/{desig_id}", json={"min_salary": 95000})
    assert u_res.status_code == 200
    assert u_res.json()["min_salary"] == 95000

    # 3. List designations
    l_res = client.get(f"/api/designations?department_id={dept_id}")
    assert l_res.status_code == 200
    assert any(d["id"] == desig_id for d in l_res.json())

    # 4. Delete
    d_res = client.delete(f"/api/designations/{desig_id}")
    assert d_res.status_code == 200

def test_employee_crud_and_search():
    depts = client.get("/api/departments").json()
    dept_id = depts[0]["id"]
    desigs = client.get("/api/designations").json()
    desig_id = desigs[0]["id"]

    # 1. Create Employee
    new_emp = {
        "full_name": "Test Engineer Austin",
        "email": "austin.test@auspify.com",
        "phone": "+1 555-9876",
        "gender": "Male",
        "dob": "1995-10-10",
        "address": "100 Innovation Way, Austin, TX",
        "department_id": dept_id,
        "designation_id": desig_id,
        "joining_date": "2026-02-01",
        "employment_type": "Full-Time",
        "salary": 92000.0,
        "status": "Active"
    }
    c_res = client.post("/api/employees", json=new_emp)
    assert c_res.status_code == 201
    emp_data = c_res.json()
    emp_id = emp_data["id"]
    assert emp_data["employee_code"].startswith("AUS-EMP")

    # 2. Search by Name
    s_res = client.get("/api/employees?search=Austin")
    assert s_res.status_code == 200
    items = s_res.json()["items"]
    assert any(e["id"] == emp_id for e in items)

    # 3. Filter by Status & Department
    f_res = client.get(f"/api/employees?department_id={dept_id}&status=Active")
    assert f_res.status_code == 200

    # 4. Toggle Status
    t_res = client.patch(f"/api/employees/{emp_id}/status", json={"status": "Inactive"})
    assert t_res.status_code == 200
    assert t_res.json()["status"] == "Inactive"

    # 5. Update Details
    u_res = client.put(f"/api/employees/{emp_id}", json={"salary": 98000.0})
    assert u_res.status_code == 200
    assert u_res.json()["salary"] == 98000.0

    # 6. Delete Employee
    del_res = client.delete(f"/api/employees/{emp_id}")
    assert del_res.status_code == 200

def test_attendance():
    # Get an employee
    emps = client.get("/api/employees?limit=1").json()["items"]
    emp_id = emps[0]["id"]

    att_payload = {
        "employee_id": emp_id,
        "attendance_date": "2026-11-01",
        "check_in": "08:50 AM",
        "check_out": "05:50 PM",
        "status": "Present",
        "notes": "Testing attendance API"
    }
    res = client.post("/api/attendance", json=att_payload)
    assert res.status_code == 200
    att_id = res.json()["id"]

    # List attendance
    l_res = client.get("/api/attendance?attendance_date=2026-11-01")
    assert l_res.status_code == 200
    assert any(a["id"] == att_id for a in l_res.json())

    # Quick mark today
    qm_res = client.post("/api/attendance/quick-mark-today")
    assert qm_res.status_code == 200

def test_reports_and_csv_export():
    # Directory
    d_res = client.get("/api/reports/directory")
    assert d_res.status_code == 200
    assert isinstance(d_res.json(), list)

    # Department summary
    dept_res = client.get("/api/reports/departments")
    assert dept_res.status_code == 200

    # Attendance summary
    att_res = client.get("/api/reports/attendance-summary")
    assert att_res.status_code == 200

    # CSV Exports
    csv_emp = client.get("/api/employees/export/csv")
    assert csv_emp.status_code == 200
    assert "text/csv" in csv_emp.headers.get("content-type", "")
    assert "Employee ID" in csv_emp.text

    csv_dept = client.get("/api/reports/export/department")
    assert csv_dept.status_code == 200
    assert "Department Name" in csv_dept.text

    csv_att = client.get("/api/reports/export/attendance")
    assert csv_att.status_code == 200
    assert "Employee Code" in csv_att.text
