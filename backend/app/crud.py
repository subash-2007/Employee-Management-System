from datetime import datetime, date
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, desc, asc

from . import models, schemas


# ==================== COMPANY SETTINGS ====================
def get_company_settings(db: Session) -> models.CompanySettings:
    settings = db.query(models.CompanySettings).first()
    if not settings:
        settings = models.CompanySettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def update_company_settings(db: Session, update_data: schemas.SettingsUpdate) -> models.CompanySettings:
    settings = get_company_settings(db)
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(settings)
    return settings


# ==================== DEPARTMENT CRUD ====================
def get_departments(db: Session) -> List[Dict[str, Any]]:
    departments = db.query(models.Department).order_by(models.Department.name.asc()).all()
    results = []
    for dept in departments:
        emp_count = db.query(models.Employee).filter(models.Employee.department_id == dept.id).count()
        desig_count = db.query(models.Designation).filter(models.Designation.department_id == dept.id).count()
        results.append({
            "id": dept.id,
            "code": dept.code,
            "name": dept.name,
            "description": dept.description,
            "head_name": dept.head_name,
            "created_at": dept.created_at,
            "employee_count": emp_count,
            "designation_count": desig_count
        })
    return results


def get_department_by_id(db: Session, dept_id: int) -> Optional[models.Department]:
    return db.query(models.Department).filter(models.Department.id == dept_id).first()


def get_department_by_name(db: Session, name: str) -> Optional[models.Department]:
    return db.query(models.Department).filter(func.lower(models.Department.name) == name.strip().lower()).first()


def get_department_by_code(db: Session, code: str) -> Optional[models.Department]:
    return db.query(models.Department).filter(func.lower(models.Department.code) == code.strip().lower()).first()


def generate_dept_code(db: Session, name: str) -> str:
    cleaned = "".join(filter(str.isalnum, name.upper()))[:4] or "DEPT"
    base_code = f"DEP-{cleaned}"
    existing = db.query(models.Department).filter(models.Department.code == base_code).first()
    if not existing:
        return base_code
    counter = 1
    while db.query(models.Department).filter(models.Department.code == f"{base_code}-{counter:02d}").first():
        counter += 1
    return f"{base_code}-{counter:02d}"


def create_department(db: Session, dept: schemas.DepartmentCreate) -> models.Department:
    code = dept.code.strip().upper() if dept.code else generate_dept_code(db, dept.name)
    db_dept = models.Department(
        code=code,
        name=dept.name.strip(),
        description=dept.description.strip() if dept.description else None,
        head_name=dept.head_name.strip() if dept.head_name else None
    )
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept


def update_department(db: Session, dept_id: int, dept_in: schemas.DepartmentUpdate) -> Optional[models.Department]:
    db_dept = get_department_by_id(db, dept_id)
    if not db_dept:
        return None
    if dept_in.name is not None:
        db_dept.name = dept_in.name.strip()
    if dept_in.description is not None:
        db_dept.description = dept_in.description.strip()
    if dept_in.head_name is not None:
        db_dept.head_name = dept_in.head_name.strip()
    db.commit()
    db.refresh(db_dept)
    return db_dept


def delete_department(db: Session, dept_id: int) -> bool:
    db_dept = get_department_by_id(db, dept_id)
    if not db_dept:
        return False
    # Set employee department_id to None or delete
    db.query(models.Employee).filter(models.Employee.department_id == dept_id).update({models.Employee.department_id: None})
    db.delete(db_dept)
    db.commit()
    return True


# ==================== DESIGNATION CRUD ====================
def get_designations(db: Session, department_id: Optional[int] = None) -> List[Dict[str, Any]]:
    query = db.query(models.Designation).options(joinedload(models.Designation.department))
    if department_id:
        query = query.filter(models.Designation.department_id == department_id)
    designations = query.order_by(models.Designation.title.asc()).all()
    
    results = []
    for d in designations:
        emp_count = db.query(models.Employee).filter(models.Employee.designation_id == d.id).count()
        results.append({
            "id": d.id,
            "code": d.code,
            "title": d.title,
            "department_id": d.department_id,
            "description": d.description,
            "salary_grade": d.salary_grade,
            "min_salary": d.min_salary,
            "max_salary": d.max_salary,
            "created_at": d.created_at,
            "department_name": d.department.name if d.department else "Unassigned",
            "employee_count": emp_count
        })
    return results


def get_designation_by_id(db: Session, desig_id: int) -> Optional[models.Designation]:
    return db.query(models.Designation).filter(models.Designation.id == desig_id).first()


def generate_designation_code(db: Session, title: str) -> str:
    cleaned = "".join(filter(str.isalnum, title.upper()))[:4] or "DESG"
    base_code = f"DES-{cleaned}"
    existing = db.query(models.Designation).filter(models.Designation.code == base_code).first()
    if not existing:
        return base_code
    counter = 1
    while db.query(models.Designation).filter(models.Designation.code == f"{base_code}-{counter:02d}").first():
        counter += 1
    return f"{base_code}-{counter:02d}"


def create_designation(db: Session, desig: schemas.DesignationCreate) -> models.Designation:
    code = desig.code.strip().upper() if desig.code else generate_designation_code(db, desig.title)
    db_desig = models.Designation(
        code=code,
        title=desig.title.strip(),
        department_id=desig.department_id,
        description=desig.description.strip() if desig.description else None,
        salary_grade=desig.salary_grade or "L1 - Standard",
        min_salary=desig.min_salary or 30000.0,
        max_salary=desig.max_salary or 150000.0
    )
    db.add(db_desig)
    db.commit()
    db.refresh(db_desig)
    return db_desig


def update_designation(db: Session, desig_id: int, desig_in: schemas.DesignationUpdate) -> Optional[models.Designation]:
    db_desig = get_designation_by_id(db, desig_id)
    if not db_desig:
        return None
    for field, value in desig_in.model_dump(exclude_unset=True).items():
        setattr(db_desig, field, value)
    db.commit()
    db.refresh(db_desig)
    return db_desig


def delete_designation(db: Session, desig_id: int) -> bool:
    db_desig = get_designation_by_id(db, desig_id)
    if not db_desig:
        return False
    db.query(models.Employee).filter(models.Employee.designation_id == desig_id).update({models.Employee.designation_id: None})
    db.delete(db_desig)
    db.commit()
    return True


# ==================== EMPLOYEE CRUD ====================
def generate_employee_code(db: Session) -> str:
    settings = get_company_settings(db)
    prefix = settings.auto_emp_prefix or "AUS-EMP"
    current_year = datetime.now().year
    
    # Format: AUS-EMP-001 or EMP-YYYY-001
    base_prefix = f"{prefix}-{current_year}-"
    highest_emp = db.query(models.Employee).filter(models.Employee.employee_code.like(f"{base_prefix}%")).order_by(models.Employee.id.desc()).first()
    
    if highest_emp and highest_emp.employee_code.startswith(base_prefix):
        try:
            num_part = int(highest_emp.employee_code.split("-")[-1])
            next_num = num_part + 1
        except Exception:
            next_num = db.query(models.Employee).count() + 1
    else:
        total = db.query(models.Employee).count()
        next_num = total + 1
        
    candidate = f"{base_prefix}{next_num:03d}"
    # Verify uniqueness
    while db.query(models.Employee).filter(models.Employee.employee_code == candidate).first():
        next_num += 1
        candidate = f"{base_prefix}{next_num:03d}"
    return candidate


def serialize_employee(emp: models.Employee) -> Dict[str, Any]:
    return {
        "id": emp.id,
        "employee_code": emp.employee_code,
        "full_name": emp.full_name,
        "email": emp.email,
        "phone": emp.phone,
        "gender": emp.gender,
        "dob": emp.dob,
        "address": emp.address,
        "department_id": emp.department_id,
        "department_name": emp.department.name if emp.department else "Unassigned",
        "department_code": emp.department.code if emp.department else None,
        "designation_id": emp.designation_id,
        "designation_title": emp.designation.title if emp.designation else "Unassigned",
        "designation_code": emp.designation.code if emp.designation else None,
        "joining_date": emp.joining_date,
        "employment_type": emp.employment_type,
        "salary": emp.salary,
        "status": emp.status,
        "created_at": emp.created_at,
        "updated_at": emp.updated_at
    }


def get_employees(
    db: Session,
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    department_id: Optional[int] = None,
    designation_id: Optional[int] = None,
    status: Optional[str] = None,
    employment_type: Optional[str] = None,
    sort_by: str = "joining_date",
    sort_order: str = "desc"
) -> Dict[str, Any]:
    query = db.query(models.Employee).options(
        joinedload(models.Employee.department),
        joinedload(models.Employee.designation)
    )

    # Search filter
    if search:
        search_term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(models.Employee.full_name).like(search_term),
                func.lower(models.Employee.employee_code).like(search_term),
                func.lower(models.Employee.email).like(search_term),
                func.lower(models.Employee.phone).like(search_term)
            )
        )

    # Other filters
    if department_id:
        query = query.filter(models.Employee.department_id == department_id)
    if designation_id:
        query = query.filter(models.Employee.designation_id == designation_id)
    if status and status.lower() != "all":
        query = query.filter(func.lower(models.Employee.status) == status.strip().lower())
    if employment_type and employment_type.lower() != "all":
        query = query.filter(func.lower(models.Employee.employment_type) == employment_type.strip().lower())

    # Sorting
    sort_column_map = {
        "joining_date": models.Employee.joining_date,
        "full_name": models.Employee.full_name,
        "salary": models.Employee.salary,
        "employee_code": models.Employee.employee_code,
        "id": models.Employee.id
    }
    col = sort_column_map.get(sort_by, models.Employee.joining_date)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(col))
    else:
        query = query.order_by(desc(col))

    total = query.count()
    total_pages = (total + limit - 1) // limit if limit > 0 else 1
    offset = (page - 1) * limit
    employees = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": [serialize_employee(emp) for emp in employees]
    }


def get_employee_by_id(db: Session, emp_id: int) -> Optional[models.Employee]:
    return db.query(models.Employee).options(
        joinedload(models.Employee.department),
        joinedload(models.Employee.designation),
        joinedload(models.Employee.attendance_records)
    ).filter(models.Employee.id == emp_id).first()


def get_employee_by_email(db: Session, email: str) -> Optional[models.Employee]:
    return db.query(models.Employee).filter(func.lower(models.Employee.email) == email.strip().lower()).first()


def get_employee_by_code(db: Session, code: str) -> Optional[models.Employee]:
    return db.query(models.Employee).filter(func.lower(models.Employee.employee_code) == code.strip().lower()).first()


def create_employee(db: Session, emp_in: schemas.EmployeeCreate) -> models.Employee:
    code = emp_in.employee_code.strip().upper() if emp_in.employee_code else generate_employee_code(db)
    
    db_emp = models.Employee(
        employee_code=code,
        full_name=emp_in.full_name.strip(),
        email=emp_in.email.strip().lower(),
        phone=emp_in.phone.strip(),
        gender=emp_in.gender,
        dob=emp_in.dob,
        address=emp_in.address.strip() if emp_in.address else None,
        department_id=emp_in.department_id,
        designation_id=emp_in.designation_id,
        joining_date=emp_in.joining_date,
        employment_type=emp_in.employment_type or "Full-Time",
        salary=emp_in.salary,
        status=emp_in.status or "Active"
    )
    db.add(db_emp)
    db.commit()
    db.refresh(db_emp)
    return db_emp


def update_employee(db: Session, emp_id: int, emp_in: schemas.EmployeeUpdate) -> Optional[models.Employee]:
    db_emp = db.query(models.Employee).filter(models.Employee.id == emp_id).first()
    if not db_emp:
        return None
    
    update_data = emp_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        if field == "email" and val:
            val = val.strip().lower()
        elif isinstance(val, str):
            val = val.strip()
        setattr(db_emp, field, val)
    
    db_emp.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_emp)
    return db_emp


def update_employee_status(db: Session, emp_id: int, status: str) -> Optional[models.Employee]:
    db_emp = db.query(models.Employee).filter(models.Employee.id == emp_id).first()
    if not db_emp:
        return None
    db_emp.status = status
    db_emp.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_emp)
    return db_emp


def delete_employee(db: Session, emp_id: int) -> bool:
    db_emp = db.query(models.Employee).filter(models.Employee.id == emp_id).first()
    if not db_emp:
        return False
    db.delete(db_emp)
    db.commit()
    return True


# ==================== ATTENDANCE CRUD ====================
def get_attendance_records(
    db: Session,
    attendance_date: Optional[str] = None,
    employee_id: Optional[int] = None,
    status: Optional[str] = None
) -> List[Dict[str, Any]]:
    query = db.query(models.Attendance).options(
        joinedload(models.Attendance.employee).joinedload(models.Employee.department)
    )
    if attendance_date:
        query = query.filter(models.Attendance.attendance_date == attendance_date)
    if employee_id:
        query = query.filter(models.Attendance.employee_id == employee_id)
    if status and status.lower() != "all":
        query = query.filter(func.lower(models.Attendance.status) == status.strip().lower())

    records = query.order_by(desc(models.Attendance.attendance_date), desc(models.Attendance.id)).all()
    
    results = []
    for r in records:
        results.append({
            "id": r.id,
            "employee_id": r.employee_id,
            "employee_code": r.employee.employee_code if r.employee else "N/A",
            "employee_name": r.employee.full_name if r.employee else "Unknown",
            "department_name": r.employee.department.name if (r.employee and r.employee.department) else "Unassigned",
            "attendance_date": r.attendance_date,
            "check_in": r.check_in,
            "check_out": r.check_out,
            "status": r.status,
            "notes": r.notes,
            "created_at": r.created_at
        })
    return results


def mark_or_update_attendance(db: Session, att: schemas.AttendanceCreate) -> Dict[str, Any]:
    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == att.employee_id,
        models.Attendance.attendance_date == att.attendance_date
    ).first()

    if existing:
        existing.check_in = att.check_in
        existing.check_out = att.check_out
        existing.status = att.status
        existing.notes = att.notes
        db.commit()
        db.refresh(existing)
        target = existing
    else:
        new_att = models.Attendance(
            employee_id=att.employee_id,
            attendance_date=att.attendance_date,
            check_in=att.check_in,
            check_out=att.check_out,
            status=att.status,
            notes=att.notes
        )
        db.add(new_att)
        db.commit()
        db.refresh(new_att)
        target = new_att

    emp = db.query(models.Employee).filter(models.Employee.id == target.employee_id).first()
    return {
        "id": target.id,
        "employee_id": target.employee_id,
        "employee_code": emp.employee_code if emp else "N/A",
        "employee_name": emp.full_name if emp else "Unknown",
        "department_name": emp.department.name if (emp and emp.department) else "Unassigned",
        "attendance_date": target.attendance_date,
        "check_in": target.check_in,
        "check_out": target.check_out,
        "status": target.status,
        "notes": target.notes,
        "created_at": target.created_at
    }


def delete_attendance(db: Session, att_id: int) -> bool:
    att = db.query(models.Attendance).filter(models.Attendance.id == att_id).first()
    if not att:
        return False
    db.delete(att)
    db.commit()
    return True


# ==================== DASHBOARD & STATS ====================
def get_dashboard_stats(db: Session) -> Dict[str, Any]:
    total_emp = db.query(models.Employee).count()
    active_emp = db.query(models.Employee).filter(models.Employee.status == "Active").count()
    inactive_emp = db.query(models.Employee).filter(models.Employee.status == "Inactive").count()
    on_leave_emp = db.query(models.Employee).filter(models.Employee.status == "On Leave").count()
    total_dept = db.query(models.Department).count()
    total_desig = db.query(models.Designation).count()

    today_str = date.today().isoformat()
    current_year_month = date.today().strftime("%Y-%m")
    
    new_emp_month = db.query(models.Employee).filter(models.Employee.joining_date.like(f"{current_year_month}%")).count()

    # Attendance today
    today_records = db.query(models.Attendance).filter(models.Attendance.attendance_date == today_str).all()
    present_today = sum(1 for r in today_records if r.status in ["Present", "Late", "Half Day"])
    absent_today = sum(1 for r in today_records if r.status == "Absent")
    attendance_rate = round((present_today / active_emp * 100), 1) if active_emp > 0 else 0.0

    # Salaries
    avg_salary_res = db.query(func.avg(models.Employee.salary)).scalar() or 0.0
    total_payroll_res = db.query(func.sum(models.Employee.salary)).scalar() or 0.0

    # Department distribution
    dept_distribution = []
    departments = db.query(models.Department).all()
    for d in departments:
        headcount = db.query(models.Employee).filter(models.Employee.department_id == d.id).count()
        total_sal = db.query(func.sum(models.Employee.salary)).filter(models.Employee.department_id == d.id).scalar() or 0.0
        dept_distribution.append({
            "name": d.name,
            "count": headcount,
            "total_salary": round(total_sal, 2)
        })

    # Status distribution
    status_distribution = [
        {"status": "Active", "count": active_emp},
        {"status": "Inactive", "count": inactive_emp},
        {"status": "On Leave", "count": on_leave_emp},
        {"status": "Terminated", "count": db.query(models.Employee).filter(models.Employee.status == "Terminated").count()}
    ]

    # Employment type distribution
    emp_types = ["Full-Time", "Part-Time", "Contract", "Intern"]
    emp_type_distribution = []
    for et in emp_types:
        count = db.query(models.Employee).filter(models.Employee.employment_type == et).count()
        emp_type_distribution.append({"type": et, "count": count})

    # Monthly Growth (last 6 months)
    # Group joining dates by month
    monthly_growth = []
    all_dates = db.query(models.Employee.joining_date).all()
    month_counts: Dict[str, int] = {}
    for (jd,) in all_dates:
        if jd and len(jd) >= 7:
            m = jd[:7]  # YYYY-MM
            month_counts[m] = month_counts.get(m, 0) + 1
    
    # Sort months
    sorted_months = sorted(month_counts.keys())[-6:] if month_counts else []
    for m in sorted_months:
        monthly_growth.append({"month": m, "count": month_counts[m]})

    # Recent 5 employees
    recent_emps = db.query(models.Employee).options(
        joinedload(models.Employee.department),
        joinedload(models.Employee.designation)
    ).order_by(desc(models.Employee.id)).limit(5).all()

    return {
        "total_employees": total_emp,
        "active_employees": active_emp,
        "inactive_employees": inactive_emp,
        "on_leave_employees": on_leave_emp,
        "total_departments": total_dept,
        "total_designations": total_desig,
        "new_employees_this_month": new_emp_month,
        "attendance_rate_today": attendance_rate,
        "present_today": present_today,
        "absent_today": absent_today,
        "avg_salary": round(avg_salary_res, 2),
        "total_payroll": round(total_payroll_res, 2),
        "department_distribution": dept_distribution,
        "status_distribution": status_distribution,
        "employment_type_distribution": emp_type_distribution,
        "monthly_growth": monthly_growth,
        "recent_employees": [serialize_employee(e) for e in recent_emps]
    }
