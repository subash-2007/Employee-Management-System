from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, ForeignKey, DateTime, Text
)
from sqlalchemy.orm import relationship
from .database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    head_name = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    employees = relationship("Employee", back_populates="department", cascade="all, delete-orphan", passive_deletes=False)
    designations = relationship("Designation", back_populates="department", cascade="all, delete-orphan")


class Designation(Base):
    __tablename__ = "designations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(100), index=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(Text, nullable=True)
    salary_grade = Column(String(50), default="L1 - Standard")
    min_salary = Column(Float, default=30000.0)
    max_salary = Column(Float, default=150000.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    department = relationship("Department", back_populates="designations")
    employees = relationship("Employee", back_populates="designation")


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_code = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=False)
    gender = Column(String(20), default="Male")  # Male, Female, Other
    dob = Column(String(30), nullable=True)  # YYYY-MM-DD
    address = Column(Text, nullable=True)
    
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    designation_id = Column(Integer, ForeignKey("designations.id", ondelete="SET NULL"), nullable=True, index=True)
    
    joining_date = Column(String(30), nullable=False, index=True)  # YYYY-MM-DD
    employment_type = Column(String(50), default="Full-Time")  # Full-Time, Part-Time, Contract, Intern
    salary = Column(Float, nullable=False, default=50000.0)
    status = Column(String(30), default="Active", index=True)  # Active, Inactive, On Leave, Terminated
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    department = relationship("Department", back_populates="employees")
    designation = relationship("Designation", back_populates="employees")
    attendance_records = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    attendance_date = Column(String(30), nullable=False, index=True)  # YYYY-MM-DD
    check_in = Column(String(30), nullable=True)   # e.g. "09:00 AM"
    check_out = Column(String(30), nullable=True)  # e.g. "05:30 PM"
    status = Column(String(30), default="Present") # Present, Absent, Half Day, On Leave, Late
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    employee = relationship("Employee", back_populates="attendance_records")


class CompanySettings(Base):
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(100), default="Auspify Technologies")
    tagline = Column(String(200), default="Enterprise Solutions & Cloud Architecture")
    contact_email = Column(String(100), default="hr@auspify.com")
    contact_phone = Column(String(50), default="+1 (800) 555-0199")
    working_hours = Column(String(50), default="09:00 AM - 06:00 PM")
    working_days = Column(String(50), default="Monday - Friday")
    auto_emp_prefix = Column(String(20), default="AUS-EMP")
    currency = Column(String(10), default="USD")
    theme = Column(String(20), default="light")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
