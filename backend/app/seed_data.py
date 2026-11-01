from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from . import models

def seed_database(db: Session):
    # Create tables if not exist
    Base.metadata.create_all(bind=engine)

    # 1. Company Settings
    settings = db.query(models.CompanySettings).first()
    if not settings:
        settings = models.CompanySettings(
            company_name="Auspify Technologies",
            tagline="Enterprise Cloud Solutions & AI Innovations",
            contact_email="hr@auspify.com",
            contact_phone="+1 (800) 555-0199",
            working_hours="09:00 AM - 06:00 PM",
            working_days="Monday - Friday",
            auto_emp_prefix="AUS-EMP",
            currency="USD",
            theme="light"
        )
        db.add(settings)
        db.commit()

    # Check if departments already exist
    if db.query(models.Department).count() > 0:
        return {"message": "Database already populated"}

    # 2. Departments
    dept_data = [
        {"code": "DEP-ENG", "name": "Software Engineering", "description": "Core software architecture, full-stack systems, APIs and cloud infrastructure.", "head_name": "Marcus Vance"},
        {"code": "DEP-HR", "name": "Human Resources", "description": "Talent acquisition, employee engagement, benefits administration, and people operations.", "head_name": "Elena Rostova"},
        {"code": "DEP-PD", "name": "Product & Design", "description": "User experience research, UI system design, and product roadmap execution.", "head_name": "Sophia Chen"},
        {"code": "DEP-MKT", "name": "Sales & Marketing", "description": "Enterprise client partnerships, client success, branding, and digital growth.", "head_name": "David Sterling"},
        {"code": "DEP-FIN", "name": "Finance & Operations", "description": "Financial planning, accounting, compliance, and corporate business operations.", "head_name": "Rachel Adams"}
    ]

    dept_objs = {}
    for d in dept_data:
        dept = models.Department(**d)
        db.add(dept)
        db.flush()
        dept_objs[d["code"]] = dept

    # 3. Designations
    desig_data = [
        # Engineering
        {"code": "DES-ARCH", "title": "Enterprise Application Architect", "dept_code": "DEP-ENG", "salary_grade": "L5 - Principal", "min_salary": 140000, "max_salary": 185000, "description": "High-level architecture, systems design and enterprise technical vision."},
        {"code": "DES-FSSE", "title": "Senior Full-Stack Developer", "dept_code": "DEP-ENG", "salary_grade": "L4 - Senior", "min_salary": 110000, "max_salary": 145000, "description": "Full-stack development across FastAPI, React and cloud microservices."},
        {"code": "DES-FEDV", "title": "Frontend Engineer", "dept_code": "DEP-ENG", "salary_grade": "L2 - Mid", "min_salary": 75000, "max_salary": 95000, "description": "Building interactive, responsive UI components with React and TypeScript."},
        {"code": "DES-BEDV", "title": "Backend API Engineer", "dept_code": "DEP-ENG", "salary_grade": "L2 - Mid", "min_salary": 80000, "max_salary": 105000, "description": "Designing high-throughput REST APIs, database schemas, and background tasks."},
        {"code": "DES-DEVO", "title": "DevOps & Cloud Engineer", "dept_code": "DEP-ENG", "salary_grade": "L3 - Specialist", "min_salary": 95000, "max_salary": 125000, "description": "CI/CD pipelines, Docker containerization, and cloud infrastructure."},
        
        # HR
        {"code": "DES-HRMG", "title": "HR Manager", "dept_code": "DEP-HR", "salary_grade": "L4 - Management", "min_salary": 85000, "max_salary": 115000, "description": "Leads people operations, organizational development, and compliance."},
        {"code": "DES-TAAC", "title": "Talent Acquisition Specialist", "dept_code": "DEP-HR", "salary_grade": "L2 - Mid", "min_salary": 60000, "max_salary": 80000, "description": "End-to-end recruitment, tech hiring, and onboarding."},

        # Product & Design
        {"code": "DES-PRDM", "title": "Senior Product Manager", "dept_code": "DEP-PD", "salary_grade": "L4 - Senior", "min_salary": 115000, "max_salary": 145000, "description": "Product strategy, user feature lifecycle, and stakeholder roadmapping."},
        {"code": "DES-UXUI", "title": "Lead UI/UX Designer", "dept_code": "DEP-PD", "salary_grade": "L3 - Senior", "min_salary": 85000, "max_salary": 115000, "description": "Design systems, interactive prototypes, and usability testing."},

        # Sales & Marketing
        {"code": "DES-SDIR", "title": "Enterprise Sales Director", "dept_code": "DEP-MKT", "salary_grade": "L5 - Executive", "min_salary": 130000, "max_salary": 175000, "description": "Leads enterprise B2B sales cycles and strategic alliances."},
        {"code": "DES-MKTS", "title": "Digital Growth Strategist", "dept_code": "DEP-MKT", "salary_grade": "L2 - Mid", "min_salary": 65000, "max_salary": 88000, "description": "Inbound growth, analytics, and marketing campaign execution."},

        # Finance
        {"code": "DES-CFOM", "title": "Finance Controller", "dept_code": "DEP-FIN", "salary_grade": "L4 - Management", "min_salary": 105000, "max_salary": 135000, "description": "Corporate budgeting, financial audits, and payroll oversight."}
    ]

    desig_objs = {}
    for dg in desig_data:
        dept = dept_objs[dg["dept_code"]]
        desig = models.Designation(
            code=dg["code"],
            title=dg["title"],
            department_id=dept.id,
            salary_grade=dg["salary_grade"],
            min_salary=dg["min_salary"],
            max_salary=dg["max_salary"],
            description=dg["description"]
        )
        db.add(desig)
        db.flush()
        desig_objs[dg["code"]] = desig

    # 4. Employees
    employees_data = [
        {
            "employee_code": "AUS-EMP-2026-001",
            "full_name": "Marcus Vance",
            "email": "marcus.vance@auspify.com",
            "phone": "+1 555-0142",
            "gender": "Male",
            "dob": "1985-04-12",
            "address": "452 Innovation Blvd, Austin, TX",
            "dept_code": "DEP-ENG",
            "desig_code": "DES-ARCH",
            "joining_date": "2024-01-15",
            "employment_type": "Full-Time",
            "salary": 165000.0,
            "status": "Active"
        },
        {
            "employee_code": "AUS-EMP-2026-002",
            "full_name": "Elena Rostova",
            "email": "elena.rostova@auspify.com",
            "phone": "+1 555-0183",
            "gender": "Female",
            "dob": "1988-09-23",
            "address": "782 Metro Way, San Francisco, CA",
            "dept_code": "DEP-HR",
            "desig_code": "DES-HRMG",
            "joining_date": "2024-03-01",
            "employment_type": "Full-Time",
            "salary": 105000.0,
            "status": "Active"
        },
        {
            "employee_code": "AUS-EMP-2026-003",
            "full_name": "Aarav Sharma",
            "email": "aarav.sharma@auspify.com",
            "phone": "+1 555-0219",
            "gender": "Male",
            "dob": "1994-06-18",
            "address": "12 Silicon Square, Seattle, WA",
            "dept_code": "DEP-ENG",
            "desig_code": "DES-FSSE",
            "joining_date": "2024-06-10",
            "employment_type": "Full-Time",
            "salary": 135000.0,
            "status": "Active"
        },
        {
            "employee_code": "AUS-EMP-2026-004",
            "full_name": "Sophia Chen",
            "email": "sophia.chen@auspify.com",
            "phone": "+1 555-0331",
            "gender": "Female",
            "dob": "1990-11-05",
            "address": "90 Design Lane, Brooklyn, NY",
            "dept_code": "DEP-PD",
            "desig_code": "DES-PRDM",
            "joining_date": "2024-08-01",
            "employment_type": "Full-Time",
            "salary": 138000.0,
            "status": "Active"
        },
        {
            "employee_code": "AUS-EMP-2026-005",
            "full_name": "David Sterling",
            "email": "david.sterling@auspify.com",
            "phone": "+1 555-0422",
            "gender": "Male",
            "dob": "1987-03-15",
            "address": "104 Commerce St, Chicago, IL",
            "dept_code": "DEP-MKT",
            "desig_code": "DES-SDIR",
            "joining_date": "2024-09-15",
            "employment_type": "Full-Time",
            "salary": 155000.0,
            "status": "Active"
        },
        {
            "employee_code": "AUS-EMP-2026-006",
            "full_name": "Priya Patel",
            "email": "priya.patel@auspify.com",
            "phone": "+1 555-0554",
            "gender": "Female",
            "dob": "1996-08-30",
            "address": "320 Tech Row, Boston, MA",
            "dept_code": "DEP-ENG",
            "desig_code": "DES-FEDV",
            "joining_date": "2025-01-10",
            "employment_type": "Full-Time",
            "salary": 88000.0,
            "status": "Active"
        },
        {
            "employee_code": "AUS-EMP-2026-007",
            "full_name": "James Mitchell",
            "email": "james.mitchell@auspify.com",
            "phone": "+1 555-0678",
            "gender": "Male",
            "dob": "1993-01-22",
            "address": "55 Lakeview Dr, Denver, CO",
            "dept_code": "DEP-ENG",
            "desig_code": "DES-BEDV",
            "joining_date": "2025-02-01",
            "employment_type": "Full-Time",
            "salary": 96000.0,
            "status": "Active"
        },
        {
            "employee_code": "AUS-EMP-2026-008",
            "full_name": "Rachel Adams",
            "email": "rachel.adams@auspify.com",
            "phone": "+1 555-0789",
            "gender": "Female",
            "dob": "1989-12-14",
            "address": "88 Financial Plaza, Charlotte, NC",
            "dept_code": "DEP-FIN",
            "desig_code": "DES-CFOM",
            "joining_date": "2025-03-15",
            "employment_type": "Full-Time",
            "salary": 120000.0,
            "status": "Active"
        },
        {
            "employee_code": "AUS-EMP-2026-009",
            "full_name": "Chloe Dupont",
            "email": "chloe.dupont@auspify.com",
            "phone": "+1 555-0891",
            "gender": "Female",
            "dob": "1995-05-19",
            "address": "15 Arts District, Los Angeles, CA",
            "dept_code": "DEP-PD",
            "desig_code": "DES-UXUI",
            "joining_date": "2025-05-20",
            "employment_type": "Full-Time",
            "salary": 98000.0,
            "status": "Active"
        },
        {
            "employee_code": "AUS-EMP-2026-010",
            "full_name": "Tariq Mansour",
            "email": "tariq.mansour@auspify.com",
            "phone": "+1 555-0912",
            "gender": "Male",
            "dob": "1992-07-08",
            "address": "40 Cloud Summit, Portland, OR",
            "dept_code": "DEP-ENG",
            "desig_code": "DES-DEVO",
            "joining_date": "2025-07-01",
            "employment_type": "Full-Time",
            "salary": 112000.0,
            "status": "Active"
        },
        {
            "employee_code": "AUS-EMP-2026-011",
            "full_name": "Hannah Abbott",
            "email": "hannah.abbott@auspify.com",
            "phone": "+1 555-1023",
            "gender": "Female",
            "dob": "1997-10-11",
            "address": "67 Beacon St, Atlanta, GA",
            "dept_code": "DEP-HR",
            "desig_code": "DES-TAAC",
            "joining_date": "2025-09-01",
            "employment_type": "Full-Time",
            "salary": 68000.0,
            "status": "Active"
        },
        {
            "employee_code": "AUS-EMP-2026-012",
            "full_name": "Lucas Silva",
            "email": "lucas.silva@auspify.com",
            "phone": "+1 555-1144",
            "gender": "Male",
            "dob": "1998-02-14",
            "address": "204 Riverside Ave, Miami, FL",
            "dept_code": "DEP-MKT",
            "desig_code": "DES-MKTS",
            "joining_date": "2025-10-15",
            "employment_type": "Contract",
            "salary": 72000.0,
            "status": "Active"
        },
        {
            "employee_code": "AUS-EMP-2026-013",
            "full_name": "Samantha Wu",
            "email": "samantha.wu@auspify.com",
            "phone": "+1 555-1255",
            "gender": "Female",
            "dob": "2001-04-18",
            "address": "18 Campus Circle, San Jose, CA",
            "dept_code": "DEP-ENG",
            "desig_code": "DES-FEDV",
            "joining_date": "2026-01-10",
            "employment_type": "Intern",
            "salary": 45000.0,
            "status": "Active"
        },
        {
            "employee_code": "AUS-EMP-2026-014",
            "full_name": "Kenneth O'Connor",
            "email": "kenneth.oconnor@auspify.com",
            "phone": "+1 555-1366",
            "gender": "Male",
            "dob": "1991-09-03",
            "address": "310 Hilltop Rd, Dallas, TX",
            "dept_code": "DEP-ENG",
            "desig_code": "DES-BEDV",
            "joining_date": "2024-04-12",
            "employment_type": "Full-Time",
            "salary": 92000.0,
            "status": "On Leave"
        },
        {
            "employee_code": "AUS-EMP-2026-015",
            "full_name": "Zoe Kravitz-Ross",
            "email": "zoe.kravitz@auspify.com",
            "phone": "+1 555-1477",
            "gender": "Female",
            "dob": "1993-03-29",
            "address": "77 Sunset Park, San Diego, CA",
            "dept_code": "DEP-PD",
            "desig_code": "DES-UXUI",
            "joining_date": "2023-11-01",
            "employment_type": "Part-Time",
            "salary": 62000.0,
            "status": "Inactive"
        }
    ]

    emp_objs = []
    for ed in employees_data:
        emp = models.Employee(
            employee_code=ed["employee_code"],
            full_name=ed["full_name"],
            email=ed["email"],
            phone=ed["phone"],
            gender=ed["gender"],
            dob=ed["dob"],
            address=ed["address"],
            department_id=dept_objs[ed["dept_code"]].id,
            designation_id=desig_objs[ed["desig_code"]].id,
            joining_date=ed["joining_date"],
            employment_type=ed["employment_type"],
            salary=ed["salary"],
            status=ed["status"]
        )
        db.add(emp)
        db.flush()
        emp_objs.append(emp)

    # 5. Attendance Records (for today and yesterday)
    today = date.today()
    yesterday = today - timedelta(days=1)

    attendance_seed = [
        # Today
        (emp_objs[0].id, today.isoformat(), "08:55 AM", "06:10 PM", "Present", "On-time arrival"),
        (emp_objs[1].id, today.isoformat(), "09:02 AM", "06:00 PM", "Present", "Regular hours"),
        (emp_objs[2].id, today.isoformat(), "08:48 AM", "05:50 PM", "Present", "Early architecture review"),
        (emp_objs[3].id, today.isoformat(), "09:15 AM", "06:30 PM", "Late", "Traffic delay, informed HR"),
        (emp_objs[4].id, today.isoformat(), "09:00 AM", "06:00 PM", "Present", "Client demonstrations"),
        (emp_objs[5].id, today.isoformat(), "08:58 AM", "05:45 PM", "Present", "Sprint deliverables"),
        (emp_objs[6].id, today.isoformat(), "09:05 AM", "06:15 PM", "Present", "API maintenance"),
        (emp_objs[7].id, today.isoformat(), "08:50 AM", "05:30 PM", "Present", "Payroll run"),
        (emp_objs[8].id, today.isoformat(), "09:10 AM", "06:00 PM", "Present", "Wireframe testing"),
        (emp_objs[9].id, today.isoformat(), "09:00 AM", "06:00 PM", "Present", "Kubernetes update"),
        (emp_objs[10].id, today.isoformat(), "09:00 AM", "06:00 PM", "Present", "Interviews scheduled"),
        (emp_objs[11].id, today.isoformat(), "09:20 AM", "06:00 PM", "Late", "Slight delay"),
        (emp_objs[12].id, today.isoformat(), "09:00 AM", "05:00 PM", "Present", "Internship cohort sprint"),
        (emp_objs[13].id, today.isoformat(), "-", "-", "On Leave", "Approved medical leave"),
        (emp_objs[14].id, today.isoformat(), "-", "-", "Absent", "No show reported"),

        # Yesterday
        (emp_objs[0].id, yesterday.isoformat(), "09:00 AM", "06:00 PM", "Present", "Architecture sync"),
        (emp_objs[1].id, yesterday.isoformat(), "08:58 AM", "06:00 PM", "Present", "HR sync"),
        (emp_objs[2].id, yesterday.isoformat(), "09:05 AM", "06:10 PM", "Present", "Feature delivery"),
        (emp_objs[3].id, yesterday.isoformat(), "09:00 AM", "06:00 PM", "Present", "Design sprint"),
        (emp_objs[5].id, yesterday.isoformat(), "09:00 AM", "01:30 PM", "Half Day", "Approved doctor appointment")
    ]

    for eid, att_date, cin, cout, stat, note in attendance_seed:
        att = models.Attendance(
            employee_id=eid,
            attendance_date=att_date,
            check_in=cin,
            check_out=cout,
            status=stat,
            notes=note
        )
        db.add(att)

    db.commit()
    return {"message": "Database seeded successfully with Auspify Technologies data"}

if __name__ == "__main__":
    db = SessionLocal()
    res = seed_database(db)
    print(res)
    db.close()
