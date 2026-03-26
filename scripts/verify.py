import os
import sys
from pathlib import Path

def verify_installation():
    """Verify complete installation"""
    
    print("\n" + "="*50)
    print("     CONFESSLY VERIFICATION")
    print("="*50 + "\n")
    
    root = Path("R:/confessly")
    
    # Check directories
    directories = ["backend", "frontend", "credentials", "docs"]
    print("📁 Directory Check:")
    for dir_name in directories:
        dir_path = root / dir_name
        if dir_path.exists():
            files = len(list(dir_path.glob("*")))
            print(f"  ✓ {dir_name} ({files} files)")
        else:
            print(f"  ❌ {dir_name} missing")
    
    # Check critical files
    print("\n📄 Critical Files Check:")
    critical_files = [
        "backend/server.js",
        "backend/package.json",
        "frontend/src/App.tsx",
        "frontend/package.json",
        "credentials/master-credentials.js",
        "docs/MASTER_ENGINEERING_DOCUMENT.md"
    ]
    
    for file in critical_files:
        file_path = root / file
        if file_path.exists():
            size = file_path.stat().st_size
            print(f"  ✓ {file} ({size} bytes)")
        else:
            print(f"  ❌ {file} missing")
    
    # Check node_modules
    print("\n📦 Dependencies Check:")
    backend_modules = root / "backend/node_modules"
    frontend_modules = root / "frontend/node_modules"
    
    if backend_modules.exists():
        print(f"  ✓ Backend: {len(list(backend_modules.glob('*')))} packages")
    else:
        print(f"  ⚠️ Backend: Run 'npm install' in backend folder")
    
    if frontend_modules.exists():
        print(f"  ✓ Frontend: {len(list(frontend_modules.glob('*')))} packages")
    else:
        print(f"  ⚠️ Frontend: Run 'npm install' in frontend folder")
    
    # Check environment files
    print("\n🔧 Environment Check:")
    env_files = ["backend/.env", "frontend/.env"]
    for env_file in env_files:
        env_path = root / env_file
        if env_path.exists():
            print(f"  ✓ {env_file}")
        else:
            print(f"  ❌ {env_file} missing")
    
    print("\n" + "="*50)
    print("✅ VERIFICATION COMPLETE")
    print("="*50)
    
    print("\n🚀 NEXT STEPS:")
    print("1. Make sure MongoDB is running")
    print("2. Run: R:\confessly\start-all.ps1")
    print("3. Open: http://localhost:5173")
    print("")
    print("📝 For first-time users:")
    print("   - Create a new account")
    print("   - Or use test credentials if available")

if __name__ == "__main__":
    verify_installation()
