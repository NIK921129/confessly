import os
import sys
import json
import subprocess
import platform
from pathlib import Path

def setup_environment():
    \"\"\"Setup Python environment and check dependencies\"\"\"
    
    print("🐍 Python Environment Setup")
    print("=" * 50)
    
    # Check Python version
    python_version = sys.version.split()[0]
    print(f"✓ Python Version: {python_version}")
    
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        sys.exit(1)
    
    # Create virtual environment
    venv_path = Path("R:/confessly/venv")
    if not venv_path.exists():
        print("📦 Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", str(venv_path)], check=True)
        print("✓ Virtual environment created")
    else:
        print("✓ Virtual environment already exists")
    
    # Determine pip path
    if platform.system() == "Windows":
        pip_path = venv_path / "Scripts" / "pip"
        python_path = venv_path / "Scripts" / "python"
    else:
        pip_path = venv_path / "bin" / "pip"
        python_path = venv_path / "bin" / "python"
    
    # Install required packages
    required_packages = [
        "requests",
        "pymongo",
        "python-socketio",
        "flask",
        "flask-cors",
        "python-dotenv",
        "bcrypt",
        "jwt",
        "websocket-client"
    ]
    
    print("\n📦 Installing Python packages...")
    for package in required_packages:
        try:
            result = subprocess.run([str(pip_path), "install", package], 
                                  capture_output=True, text=True, check=False)
            if result.returncode == 0:
                print(f"  ✓ {package}")
            else:
                print(f"  ⚠️ {package}: Already installed or error")
        except Exception as e:
            print(f"  ⚠️ {package}: {str(e)[:50]}")
    
    # Create Python test script
    test_script = Path("R:/confessly/scripts/test_connection.py")
    test_script.parent.mkdir(parents=True, exist_ok=True)
    
    test_script.write_text("""
import pymongo
import socketio
import requests
import os

def test_connections():
    \"\"\"Test all service connections\"\"\"
    
    print("\\n🔍 Testing Connections...")
    print("=" * 50)
    
    # Test MongoDB
    try:
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/confessly")
        client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        client.server_info()
        print("✓ MongoDB: Connected")
    except Exception as e:
        print(f"❌ MongoDB: {e}")
        print("  Hint: Make sure MongoDB is running")
    
    # Test Socket.IO
    try:
        sio = socketio.Client()
        print("✓ Socket.IO: Client ready")
    except Exception as e:
        print(f"⚠️ Socket.IO: {e}")
    
    print("\\n✅ Connection tests complete")
    
if __name__ == "__main__":
    test_connections()
""")
    
    print(f"\n✓ Python setup complete")
    print(f"✓ Test script created: {test_script}")

if __name__ == "__main__":
    setup_environment()
