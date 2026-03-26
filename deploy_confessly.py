import subprocess
import os
import sys
import time

def run_ps_command(command):
    """Executes a PowerShell command with UTF-8 encoding support."""
    print(f"🚀 Running: {command}")
    
    # We add env setting to force UTF-8 in the shell session as well
    process = subprocess.Popen(
        ["powershell", "-ExecutionPolicy", "Bypass", "-Command", 
         f"$OutputEncoding = [Console]::InputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; {command}"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8", # This prevents the UnicodeDecodeError
        errors="replace"   # This prevents crashing if a character is truly unknown
    )
    
    # Real-time output processing
    if process.stdout:
        for line in process.stdout:
            print(f"  [LOG]: {line.strip()}")
    
    stdout, stderr = process.communicate()
    
    if process.returncode != 0:
        if stderr:
            print(f"❌ Error Output: {stderr.strip()}")
        return False
    return True

def deploy():
    print("🎭 --- CONFESSLY ONE-CLICK DEPLOYMENT 2026 ---")
    
    # Step 1: Validate Credentials
    print("\n🔐 Step 1: Validating Master Credentials...")
    # Use the absolute path we found earlier
    master_cred_path = r"R:\123456\confessly\credentials\master-credentials.js"
    
    if not run_ps_command(f"node '{master_cred_path}'"):
        print(f"🛑 Credential validation failed. File not found at: {master_cred_path}")
        sys.exit(1)
    
    print("✅ Credentials validated successfully!")

    # Step 2: Backend Deployment (Render via Git)
    print("\n📡 Step 2: Pushing Backend Updates to GitHub...")
    curr_time = time.strftime("%Y-%m-%d %H:%M:%S")
    
    # Run git add
    if not run_ps_command("git add ."):
        print("❌ Git add failed")
        sys.exit(1)
    
    # Try to commit, but don't fail if there's nothing new
    print("🚀 Running: git commit")
    commit_result = subprocess.run(
        ["powershell", "-Command", f'git commit -m "Deployment Update: {curr_time}"'],
        capture_output=True, 
        text=True,
        encoding="utf-8",
        errors="replace"
    )
    
    # If it fails with "nothing to commit", we just ignore it and move to push
    if "nothing to commit" in commit_result.stdout or commit_result.returncode == 0:
        print("  [LOG]: Nothing new to commit or commit successful. Proceeding to push...")
        
        # Push with force to ensure any previous failed pushes are resolved
        if not run_ps_command("git push origin main --force"):
            print("❌ Git push failed")
            sys.exit(1)
    else:
        print(f"❌ Actual Git Error: {commit_result.stderr}")
        sys.exit(1)

    # Step 3: Frontend Deployment (Vercel)
    print("\n🎨 Step 3: Deploying Frontend to Vercel...")
    # Change directory within the command string for consistency
    vercel_cmd = "cd frontend; vercel --prod --yes --force"
    if not run_ps_command(vercel_cmd):
        print("❌ Vercel deployment failed. Ensure Vercel CLI is installed (npm install -g vercel).")
        sys.exit(1)

    print("\n🚀 --- ALL SYSTEMS LIVE ---")
    print("🔗 Frontend: https://confessly.vercel.app")
    print("🔗 Backend:  https://confessly-api.onrender.com")

if __name__ == "__main__":
    try:
        deploy()
    except KeyboardInterrupt:
        print("\n\n🛑 Deployment cancelled by user.")
        sys.exit(0)