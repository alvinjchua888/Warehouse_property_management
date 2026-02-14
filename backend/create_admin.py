"""
Script to create a default admin user for testing.
Run this after the database is initialized.
"""
import sys
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.user import User
from app.utils.auth import get_password_hash

def create_admin_user():
    """Create a default admin user if it doesn't exist."""
    db = SessionLocal()
    try:
        # Check if admin user already exists
        existing_user = db.query(User).filter(User.email == "admin@warehouse.com").first()
        if existing_user:
            print("❌ Admin user already exists!")
            print(f"   Email: admin@warehouse.com")
            return

        # Create admin user
        admin_user = User(
            email="admin@warehouse.com",
            full_name="Admin User",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            is_active=True
        )
        db.add(admin_user)
        db.commit()

        print("✅ Admin user created successfully!")
        print(f"   Email: admin@warehouse.com")
        print(f"   Password: admin123")
        print(f"   Role: admin")
        print("\n⚠️  Please change this password after first login!")

    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating default admin user...")
    create_admin_user()
