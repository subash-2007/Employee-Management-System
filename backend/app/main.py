import csv
import io
from datetime import date, datetime, timedelta
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db, SessionLocal
from . import models, schemas, crud
from .seed_data import seed_database

# Create DB tables
Base.metadata.create_all(bind=engine)

# Auto seed if empty
with SessionLocal() as db:
    seed_database(db)

app = FastAPI(
    title="Employee Management System (EMS) API",
    description="Enterprise HRMS Backend for Auspify Technologies",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "online",
        "service": "Auspify EMS API",
        "timestamp": datetime.utcnow().isoformat()
    }


# ==================== DASHBOARD ====================
@app.get("/api/dashboard/stats", response_model=schemas.DashboardStats, tags=["Dashboard"])
def get_dashboard_statistics(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)


# ==================== DEPARTMENTS ====================
@app.get("/api/departments", response_model=List[schemas.DepartmentResponse], tags=["Departments"])
def list_departments(db: Session = Depends(get_db)):
    return crud.get_departments(db)


@app.get("/api/departments/{dept_id}", response_model=schemas.DepartmentResponse, tags=["Departments"])
def get_department(dept_id: int, db: Session = Depends(get_db)):
    dept = crud.get_department_by_id(db, dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    emp_count = db.query(models.Employee).filter(models.Employee.department_id == dept.id).count()
    desig_count = db.query(models.Designation).filter(models.Designation.department_id == dept.id).count()
    return {
        "id": dept.id,
        "code": dept.code,
        "name": dept.name,
        "description": dept.description,
        "head_name": dept.head_name,
        "created_at": dept.created_at,
        "employee_count": emp_count,
        "designation_count": desig_count
    }


@app.post("/api/departments", response_model=schemas.DepartmentResponse, status_code=status.HTTP_201_CREATED, tags=["Departments"])
def create_department(dept_in: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    existing = crud.get_department_by_name(db, dept_in.name)
    if existing:
        raise HTTPException(status_code=400, detail="A department with this name already exists")
    if dept_in.code:
        existing_code = crud.get_department_by_code(db, dept_in.code)
        if existing_code:
            raise HTTPException(status_code=400, detail="A department with this code already exists")
    dept = crud.create_department(db, dept_in)
    return {
        "id": dept.id,
        "code": dept.code,
        "name": dept.name,
        "description": dept.description,
        "head_name": dept.head_name,
        "created_at": dept.created_at,
        "employee_count": 0,
        "designation_count": 0
    }


@app.put("/api/departments/{dept_id}", response_model=schemas.DepartmentResponse, tags=["Departments"])
def update_department(dept_id: int, dept_in: schemas.DepartmentUpdate, db: Session = Depends(get_db)):
    dept = crud.get_department_by_id(db, dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    if dept_in.name and dept_in.name.strip().lower() != dept.name.lower():
        existing = crud.get_department_by_name(db, dept_in.name)
        if existing and existing.id != dept_id:
            raise HTTPException(status_code=400, detail="Another department already uses this name")
    updated = crud.update_department(db, dept_id, dept_in)
    emp_count = db.query(models.Employee).filter(models.Employee.department_id == updated.id).count()
    desig_count = db.query(models.Designation).filter(models.Designation.department_id == updated.id).count()
    return {
        "id": updated.id,
        "code": updated.code,
        "name": updated.name,
        "description": updated.description,
        "head_name": updated.head_name,
        "created_at": updated.created_at,
        "employee_count": emp_count,
        "designation_count": desig_count
    }


@app.delete("/api/departments/{dept_id}", tags=["Departments"])
def delete_department(dept_id: int, db: Session = Depends(get_db)):
    dept = crud.get_department_by_id(db, dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    crud.delete_department(db, dept_id)
    return {"message": f"Department '{dept.name}' deleted successfully"}


# ==================== DESIGNATIONS ====================
@app.get("/api/designations", response_model=List[schemas.DesignationResponse], tags=["Designations"])
def list_designations(department_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    return crud.get_designations(db, department_id=department_id)


@app.get("/api/designations/{desig_id}", response_model=schemas.DesignationResponse, tags=["Designations"])
def get_designation(desig_id: int, db: Session = Depends(get_db)):
    desig = crud.get_designation_by_id(db, desig_id)
    if not desig:
        raise HTTPException(status_code=404, detail="Designation not found")
    emp_count = db.query(models.Employee).filter(models.Employee.designation_id == desig.id).count()
    return {
        "id": desig.id,
        "code": desig.code,
        "title": desig.title,
        "department_id": desig.department_id,
        "description": desig.description,
        "salary_grade": desig.salary_grade,
        "min_salary": desig.min_salary,
        "max_salary": desig.max_salary,
        "created_at": desig.created_at,
        "department_name": desig.department.name if desig.department else "Unassigned",
        "employee_count": emp_count
    }


@app.post("/api/designations", response_model=schemas.DesignationResponse, status_code=status.HTTP_201_CREATED, tags=["Designations"])
def create_designation(desig_in: schemas.DesignationCreate, db: Session = Depends(get_db)):
    dept = crud.get_department_by_id(db, desig_in.department_id)
    if not dept:
        raise HTTPException(status_code=400, detail="Assigned department does not exist")
    desig = crud.create_designation(db, desig_in)
    return {
        "id": desig.id,
        "code": desig.code,
        "title": desig.title,
        "department_id": desig.department_id,
        "description": desig.description,
        "salary_grade": desig.salary_grade,
        "min_salary": desig.min_salary,
        "max_salary": desig.max_salary,
        "created_at": desig.created_at,
        "department_name": dept.name,
        "employee_count": 0
    }


@app.put("/api/designations/{desig_id}", response_model=schemas.DesignationResponse, tags=["Designations"])
def update_designation(desig_id: int, desig_in: schemas.DesignationUpdate, db: Session = Depends(get_db)):
    desig = crud.get_designation_by_id(db, desig_id)
    if not desig:
        raise HTTPException(status_code=404, detail="Designation not found")
    if desig_in.department_id:
        dept = crud.get_department_by_id(db, desig_in.department_id)
        if not dept:
            raise HTTPException(status_code=400, detail="Assigned department does not exist")
    updated = crud.update_designation(db, desig_id, desig_in)
    emp_count = db.query(models.Employee).filter(models.Employee.designation_id == updated.id).count()
    return {
        "id": updated.id,
        "code": updated.code,
        "title": updated.title,
        "department_id": updated.department_id,
        "description": updated.description,
        "salary_grade": updated.salary_grade,
        "min_salary": updated.min_salary,
        "max_salary": updated.max_salary,
        "created_at": updated.created_at,
        "department_name": updated.department.name if updated.department else "Unassigned",
        "employee_count": emp_count
    }


@app.delete("/api/designations/{desig_id}", tags=["Designations"])
def delete_designation(desig_id: int, db: Session = Depends(get_db)):
    desig = crud.get_designation_by_id(db, desig_id)
    if not desig:
        raise HTTPException(status_code=404, detail="Designation not found")
    crud.delete_designation(db, desig_id)
    return {"message": f"Designation '{desig.title}' deleted successfully"}


# ==================== EMPLOYEES ====================
@app.get("/api/employees", response_model=schemas.EmployeeListResponse, tags=["Employees"])
def list_employees(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    designation_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    employment_type: Optional[str] = Query(None),
    sort_by: str = Query("joining_date"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db)
):
    return crud.get_employees(
        db=db,
        page=page,
        limit=limit,
        search=search,
        department_id=department_id,
        designation_id=designation_id,
        status=status,
        employment_type=employment_type,
        sort_by=sort_by,
        sort_order=sort_order
    )


@app.get("/api/employees/export/csv", tags=["Employees"])
def export_employees_csv(db: Session = Depends(get_db)):
    # Fetch all employees
    emps = db.query(models.Employee).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Employee ID", "Full Name", "Email", "Phone", "Gender",
        "Date of Birth", "Address", "Department", "Designation",
        "Joining Date", "Employment Type", "Salary", "Status"
    ])
    for e in emps:
        dept_name = e.department.name if e.department else "Unassigned"
        desig_title = e.designation.title if e.designation else "Unassigned"
        writer.writerow([
            e.employee_code, e.full_name, e.email, e.phone, e.gender,
            e.dob or "", e.address or "", dept_name, desig_title,
            e.joining_date, e.employment_type, f"{e.salary:.2f}", e.status
        ])
    
    csv_data = output.getvalue()
    filename = f"employees_{date.today().isoformat()}.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.get("/api/employees/{emp_id}", response_model=schemas.EmployeeDetailResponse, tags=["Employees"])
def get_employee(emp_id: int, db: Session = Depends(get_db)):
    emp = crud.get_employee_by_id(db, emp_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    emp_data = crud.serialize_employee(emp)
    
    # Recent attendance
    recent_att = db.query(models.Attendance).filter(
        models.Attendance.employee_id == emp.id
    ).order_by(models.Attendance.attendance_date.desc()).limit(10).all()
    
    att_list = []
    for r in recent_att:
        att_list.append({
            "id": r.id,
            "employee_id": r.employee_id,
            "employee_code": emp.employee_code,
            "employee_name": emp.full_name,
            "department_name": emp.department.name if emp.department else "Unassigned",
            "attendance_date": r.attendance_date,
            "check_in": r.check_in,
            "check_out": r.check_out,
            "status": r.status,
            "notes": r.notes,
            "created_at": r.created_at
        })
    emp_data["recent_attendance"] = att_list
    return emp_data


@app.post("/api/employees", response_model=schemas.EmployeeResponse, status_code=status.HTTP_201_CREATED, tags=["Employees"])
def create_employee(emp_in: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    # Check email uniqueness
    existing = crud.get_employee_by_email(db, emp_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="An employee with this email address already exists")
    
    # Check custom employee_code uniqueness if supplied
    if emp_in.employee_code:
        existing_code = crud.get_employee_by_code(db, emp_in.employee_code)
        if existing_code:
            raise HTTPException(status_code=400, detail="An employee with this employee code already exists")
            
    # Validate department and designation
    if emp_in.department_id:
        dept = crud.get_department_by_id(db, emp_in.department_id)
        if not dept:
            raise HTTPException(status_code=400, detail="Selected department does not exist")
    if emp_in.designation_id:
        desig = crud.get_designation_by_id(db, emp_in.designation_id)
        if not desig:
            raise HTTPException(status_code=400, detail="Selected designation does not exist")

    created = crud.create_employee(db, emp_in)
    return crud.serialize_employee(created)


@app.put("/api/employees/{emp_id}", response_model=schemas.EmployeeResponse, tags=["Employees"])
def update_employee(emp_id: int, emp_in: schemas.EmployeeUpdate, db: Session = Depends(get_db)):
    emp = crud.get_employee_by_id(db, emp_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    if emp_in.email and emp_in.email.strip().lower() != emp.email.lower():
        existing = crud.get_employee_by_email(db, emp_in.email)
        if existing and existing.id != emp_id:
            raise HTTPException(status_code=400, detail="Another employee with this email already exists")

    if emp_in.department_id:
        dept = crud.get_department_by_id(db, emp_in.department_id)
        if not dept:
            raise HTTPException(status_code=400, detail="Selected department does not exist")
    if emp_in.designation_id:
        desig = crud.get_designation_by_id(db, emp_in.designation_id)
        if not desig:
            raise HTTPException(status_code=400, detail="Selected designation does not exist")

    updated = crud.update_employee(db, emp_id, emp_in)
    return crud.serialize_employee(updated)


@app.patch("/api/employees/{emp_id}/status", response_model=schemas.EmployeeResponse, tags=["Employees"])
def toggle_employee_status(emp_id: int, status_in: schemas.EmployeeStatusUpdate, db: Session = Depends(get_db)):
    emp = crud.get_employee_by_id(db, emp_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    valid_statuses = ["Active", "Inactive", "On Leave", "Terminated"]
    if status_in.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    updated = crud.update_employee_status(db, emp_id, status_in.status)
    return crud.serialize_employee(updated)


@app.delete("/api/employees/{emp_id}", tags=["Employees"])
def delete_employee(emp_id: int, db: Session = Depends(get_db)):
    emp = crud.get_employee_by_id(db, emp_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    crud.delete_employee(db, emp_id)
    return {"message": f"Employee '{emp.full_name}' deleted successfully"}


# ==================== ATTENDANCE ====================
@app.get("/api/attendance", response_model=List[schemas.AttendanceResponse], tags=["Attendance"])
def list_attendance(
    attendance_date: Optional[str] = Query(None),
    employee_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return crud.get_attendance_records(db, attendance_date=attendance_date, employee_id=employee_id, status=status)


@app.post("/api/attendance", response_model=schemas.AttendanceResponse, tags=["Attendance"])
def mark_attendance(att_in: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    emp = crud.get_employee_by_id(db, att_in.employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return crud.mark_or_update_attendance(db, att_in)


@app.post("/api/attendance/quick-mark-today", tags=["Attendance"])
def quick_mark_today_attendance(
    status: str = Query("Present"),
    db: Session = Depends(get_db)
):
    """Mark attendance for all active employees for today if not already marked"""
    today_str = date.today().isoformat()
    active_emps = db.query(models.Employee).filter(models.Employee.status == "Active").all()
    count_marked = 0
    for emp in active_emps:
        existing = db.query(models.Attendance).filter(
            models.Attendance.employee_id == emp.id,
            models.Attendance.attendance_date == today_str
        ).first()
        if not existing:
            new_att = models.Attendance(
                employee_id=emp.id,
                attendance_date=today_str,
                check_in="09:00 AM",
                check_out="06:00 PM",
                status=status,
                notes="Automated Daily Shift Record"
            )
            db.add(new_att)
            count_marked += 1
    db.commit()
    return {"message": f"Recorded attendance for {count_marked} employees for {today_str}"}


@app.delete("/api/attendance/{att_id}", tags=["Attendance"])
def remove_attendance(att_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_attendance(db, att_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return {"message": "Attendance record removed"}


# ==================== REPORTS & EXPORT ====================
@app.get("/api/reports/directory", tags=["Reports"])
def report_employee_directory(db: Session = Depends(get_db)):
    emps = db.query(models.Employee).order_by(models.Employee.full_name.asc()).all()
    return [crud.serialize_employee(e) for e in emps]


@app.get("/api/reports/departments", tags=["Reports"])
def report_department_summary(db: Session = Depends(get_db)):
    depts = db.query(models.Department).all()
    report = []
    for d in depts:
        emps = db.query(models.Employee).filter(models.Employee.department_id == d.id).all()
        headcount = len(emps)
        active_count = sum(1 for e in emps if e.status == "Active")
        total_salary = sum(e.salary for e in emps)
        avg_salary = (total_salary / headcount) if headcount > 0 else 0
        report.append({
            "department_code": d.code,
            "department_name": d.name,
            "department_head": d.head_name or "N/A",
            "total_employees": headcount,
            "active_employees": active_count,
            "total_salary_budget": round(total_salary, 2),
            "average_salary": round(avg_salary, 2)
        })
    return report


@app.get("/api/reports/new-joiners", tags=["Reports"])
def report_new_joiners(days: int = Query(90), db: Session = Depends(get_db)):
    # Recent employees joined
    cutoff_date = (date.today() - timedelta(days=days)).isoformat()
    emps = db.query(models.Employee).filter(models.Employee.joining_date >= cutoff_date).order_by(models.Employee.joining_date.desc()).all()
    return [crud.serialize_employee(e) for e in emps]


@app.get("/api/reports/active-inactive", tags=["Reports"])
def report_status_breakdown(db: Session = Depends(get_db)):
    statuses = ["Active", "Inactive", "On Leave", "Terminated"]
    breakdown = {}
    for s in statuses:
        emps = db.query(models.Employee).filter(models.Employee.status == s).all()
        breakdown[s] = {
            "count": len(emps),
            "total_salary": sum(e.salary for e in emps),
            "employees": [crud.serialize_employee(e) for e in emps]
        }
    return breakdown


@app.get("/api/reports/attendance-summary", tags=["Reports"])
def report_attendance_summary(db: Session = Depends(get_db)):
    all_att = db.query(models.Attendance).all()
    total_records = len(all_att)
    status_counts = {}
    for a in all_att:
        status_counts[a.status] = status_counts.get(a.status, 0) + 1
    return {
        "total_records": total_records,
        "present_count": status_counts.get("Present", 0),
        "absent_count": status_counts.get("Absent", 0),
        "late_count": status_counts.get("Late", 0),
        "half_day_count": status_counts.get("Half Day", 0),
        "on_leave_count": status_counts.get("On Leave", 0),
        "status_breakdown": status_counts
    }


@app.get("/api/reports/export/{report_type}", tags=["Reports"])
def export_report_csv(report_type: str, db: Session = Depends(get_db)):
    output = io.StringIO()
    writer = csv.writer(output)
    
    if report_type == "department":
        writer.writerow(["Dept Code", "Department Name", "Head Name", "Total Employees", "Active Employees", "Total Budget", "Avg Salary"])
        summary = report_department_summary(db)
        for item in summary:
            writer.writerow([
                item["department_code"], item["department_name"], item["department_head"],
                item["total_employees"], item["active_employees"], f"${item['total_salary_budget']:,.2f}", f"${item['average_salary']:,.2f}"
            ])
        filename = f"department_report_{date.today().isoformat()}.csv"

    elif report_type == "attendance":
        writer.writerow(["Date", "Employee Code", "Employee Name", "Department", "Check In", "Check Out", "Status", "Notes"])
        records = crud.get_attendance_records(db)
        for r in records:
            writer.writerow([
                r["attendance_date"], r["employee_code"], r["employee_name"],
                r["department_name"], r["check_in"] or "", r["check_out"] or "",
                r["status"], r["notes"] or ""
            ])
        filename = f"attendance_report_{date.today().isoformat()}.csv"

    else: # Directory / All employees
        writer.writerow(["Employee ID", "Full Name", "Email", "Phone", "Gender", "DOB", "Department", "Designation", "Joining Date", "Type", "Salary", "Status"])
        emps = db.query(models.Employee).all()
        for e in emps:
            dept_name = e.department.name if e.department else "Unassigned"
            desig_title = e.designation.title if e.designation else "Unassigned"
            writer.writerow([
                e.employee_code, e.full_name, e.email, e.phone, e.gender, e.dob or "",
                dept_name, desig_title, e.joining_date, e.employment_type, f"${e.salary:,.2f}", e.status
            ])
        filename = f"employee_directory_{date.today().isoformat()}.csv"

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# ==================== SETTINGS ====================
@app.get("/api/settings", response_model=schemas.SettingsResponse, tags=["Settings"])
def get_settings(db: Session = Depends(get_db)):
    return crud.get_company_settings(db)


@app.put("/api/settings", response_model=schemas.SettingsResponse, tags=["Settings"])
def update_settings(settings_in: schemas.SettingsUpdate, db: Session = Depends(get_db)):
    return crud.update_company_settings(db, settings_in)


@app.post("/api/settings/reset-seed", tags=["Settings"])
def reset_sample_data(db: Session = Depends(get_db)):
    # Drop existing data and reseed
    db.query(models.Attendance).delete()
    db.query(models.Employee).delete()
    db.query(models.Designation).delete()
    db.query(models.Department).delete()
    db.commit()
    seed_database(db)
    return {"message": "Database successfully reseeded with Auspify Technologies sample records"}
