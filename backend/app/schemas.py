from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# ----------------- Department Schemas -----------------
class DepartmentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    head_name: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    code: Optional[str] = None  # auto-generated if omitted

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    head_name: Optional[str] = None

class DepartmentResponse(DepartmentBase):
    id: int
    code: str
    created_at: datetime
    employee_count: int = 0
    designation_count: int = 0

    model_config = ConfigDict(from_attributes=True)


# ----------------- Designation Schemas -----------------
class DesignationBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=100)
    department_id: int
    description: Optional[str] = None
    salary_grade: Optional[str] = "L1 - Standard"
    min_salary: Optional[float] = 30000.0
    max_salary: Optional[float] = 150000.0

class DesignationCreate(DesignationBase):
    code: Optional[str] = None

class DesignationUpdate(BaseModel):
    title: Optional[str] = None
    department_id: Optional[int] = None
    description: Optional[str] = None
    salary_grade: Optional[str] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None

class DesignationResponse(DesignationBase):
    id: int
    code: str
    created_at: datetime
    department_name: Optional[str] = None
    employee_count: int = 0

    model_config = ConfigDict(from_attributes=True)


# ----------------- Attendance Schemas -----------------
class AttendanceBase(BaseModel):
    employee_id: int
    attendance_date: str
    check_in: Optional[str] = "09:00 AM"
    check_out: Optional[str] = "06:00 PM"
    status: str = "Present"  # Present, Absent, Half Day, On Leave, Late
    notes: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class AttendanceResponse(AttendanceBase):
    id: int
    created_at: datetime
    employee_code: Optional[str] = None
    employee_name: Optional[str] = None
    department_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ----------------- Employee Schemas -----------------
class EmployeeBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=25)
    gender: str = "Male"
    dob: Optional[str] = None
    address: Optional[str] = None
    department_id: Optional[int] = None
    designation_id: Optional[int] = None
    joining_date: str
    employment_type: str = "Full-Time"  # Full-Time, Part-Time, Contract, Intern
    salary: float = Field(..., gt=0)
    status: str = "Active"  # Active, Inactive, On Leave, Terminated

class EmployeeCreate(EmployeeBase):
    employee_code: Optional[str] = None

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    address: Optional[str] = None
    department_id: Optional[int] = None
    designation_id: Optional[int] = None
    joining_date: Optional[str] = None
    employment_type: Optional[str] = None
    salary: Optional[float] = None
    status: Optional[str] = None

class EmployeeStatusUpdate(BaseModel):
    status: str

class EmployeeResponse(EmployeeBase):
    id: int
    employee_code: str
    created_at: datetime
    updated_at: datetime
    department_name: Optional[str] = None
    department_code: Optional[str] = None
    designation_title: Optional[str] = None
    designation_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class EmployeeDetailResponse(EmployeeResponse):
    recent_attendance: List[AttendanceResponse] = []


class EmployeeListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    items: List[EmployeeResponse]


# ----------------- Dashboard & Stats -----------------
class DepartmentDistributionItem(BaseModel):
    name: str
    count: int
    total_salary: float

class StatusDistributionItem(BaseModel):
    status: str
    count: int

class EmploymentTypeItem(BaseModel):
    type: str
    count: int

class MonthlyGrowthItem(BaseModel):
    month: str
    count: int

class DashboardStats(BaseModel):
    total_employees: int
    active_employees: int
    inactive_employees: int
    on_leave_employees: int
    total_departments: int
    total_designations: int
    new_employees_this_month: int
    attendance_rate_today: float
    present_today: int
    absent_today: int
    avg_salary: float
    total_payroll: float
    department_distribution: List[DepartmentDistributionItem]
    status_distribution: List[StatusDistributionItem]
    employment_type_distribution: List[EmploymentTypeItem]
    monthly_growth: List[MonthlyGrowthItem]
    recent_employees: List[EmployeeResponse]


# ----------------- Company Settings -----------------
class SettingsBase(BaseModel):
    company_name: str = "Auspify Technologies"
    tagline: str = "Enterprise Solutions & Cloud Architecture"
    contact_email: EmailStr = "hr@auspify.com"
    contact_phone: str = "+1 (800) 555-0199"
    working_hours: str = "09:00 AM - 06:00 PM"
    working_days: str = "Monday - Friday"
    auto_emp_prefix: str = "AUS-EMP"
    currency: str = "USD"
    theme: str = "light"

class SettingsUpdate(BaseModel):
    company_name: Optional[str] = None
    tagline: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    working_hours: Optional[str] = None
    working_days: Optional[str] = None
    auto_emp_prefix: Optional[str] = None
    currency: Optional[str] = None
    theme: Optional[str] = None

class SettingsResponse(SettingsBase):
    id: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
