import subprocess
import os
import sys
import time

def run_ps_command(command):
    """Executes a PowerShell command with UTF-8 support and real-time logging."""
    print(f"🚀 Running: {command}")
    process = subprocess.Popen(
        ["powershell", "-ExecutionPolicy", "Bypass", "-Command", 
         f"$OutputEncoding = [Console]::InputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; {command}"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace"
    )
    
    if process.stdout:
        for line in process.stdout:
            print(f"  [LOG]: {line.strip()}")
    
    stdout, stderr = process.communicate()
    if process.returncode != 0:
        if stderr:
            print(f"❌ Error Output: {stderr.strip()}")
        return False
    return True

def run_command_with_output(command):
    """Runs a command and returns the result object."""
    return subprocess.run(
        ["powershell", "-Command", command],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )

def deploy():
    print("🎭 --- CONFESSLY ONE-CLICK DEPLOYMENT 2026 ---")
    
    # Step 1: Validate Credentials Presence
    print("\n🔐 Step 1: Checking Master Credentials...")
    base_dir = os.path.dirname(os.path.abspath(__file__))
    master_cred_path = os.path.join(base_dir, "credentials", "master-credentials.json")
    
    if os.path.exists(master_cred_path):
        # We found it! We won't 'open' it to avoid encoding/empty file crashes.
        print(f"✅ Credentials file detected at: {master_cred_path}")
    else:
        print(f"🛑 Error: Credentials file NOT FOUND at: {master_cred_path}")
        sys.exit(1)

    # Step 2: Backend Deployment
    print("\n📡 Step 2: Pushing Backend Updates to GitHub...")
    run_ps_command("git add .")
    
    curr_time = time.strftime("%Y-%m-%d %H:%M:%S")
    commit_result = run_command_with_output(f'git commit -m "Deployment Update: {curr_time}"')
    
    # Logic to handle 'nothing to commit' vs actual errors
    if "nothing to commit" in commit_result.stdout or commit_result.returncode == 0:
        print("  [LOG]: Git state clean or commit successful. Pushing...")
    else:
        print(f"⚠️  Git Note: {commit_result.stdout.strip() if commit_result.stdout else 'Proceeding...'}")

    if not run_ps_command("git push origin main --force"):
        print("❌ Git push failed.")
        sys.exit(1)
    print("✅ Git push successful!")

    # Step 3: Frontend Deployment
    print("\n🎨 Step 3: Deploying Frontend to Vercel...")
    if not os.path.exists('frontend'):
        print("❌ Error: 'frontend' folder not found!")
        sys.exit(1)
    
    original_dir = os.getcwd()
    os.chdir('frontend')
    
    try:
        print("🚀 Building on Vercel with Dependency Fix...")
        # This build-env flag is CRITICAL to fix your 'npm install' crash
        vercel_cmd = "vercel --prod --yes --force --build-env NPM_CONFIG_LEGACY_PEER_DEPS=true"
        
        if not run_ps_command(vercel_cmd):
            print("❌ Vercel deployment failed.")
            sys.exit(1)
        
        print("✅ Frontend live!")
    finally:
        os.chdir(original_dir)
    
    print("\n🚀 --- ALL SYSTEMS LIVE ---")
    print("🔗 UI:   https://frontend-theta-umber-ao6057gsrx.vercel.app")
    print("🔗 API:  https://confessly-api.onrender.com")

if __name__ == "__main__":
    try:
        deploy()
    except KeyboardInterrupt:
        print("\n\n🛑 Deployment cancelled.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)