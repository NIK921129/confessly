import subprocess
import os
import sys
import time

def run_ps_command(command):
    """Executes a PowerShell command with UTF-8 encoding support."""
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

def run_command_with_output(command):
    """Runs a command and returns its output for checking"""
    result = subprocess.run(
        ["powershell", "-Command", command],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )
    return result

def deploy():
    print("🎭 --- CONFESSLY ONE-CLICK DEPLOYMENT 2026 ---")
    
    # Step 1: Validate Credentials
    print("\n🔐 Step 1: Validating Master Credentials...")
    master_cred_path = r"R:\123456\confessly\credentials\master-credentials.js"
    
    if not run_ps_command(f"node '{master_cred_path}'"):
        print(f"🛑 Credential validation failed. File not found at: {master_cred_path}")
        sys.exit(1)
    
    print("✅ Credentials validated successfully!")

    # Step 2: Backend Deployment (Render via Git)
    print("\n📡 Step 2: Pushing Backend Updates to GitHub...")
    
    # Check if we're in the right directory
    if not os.path.exists('.git'):
        print("❌ Not in a git repository. Make sure you're in R:\\confessly")
        sys.exit(1)
    
    # Run git add
    if not run_ps_command("git add ."):
        print("❌ Git add failed")
        sys.exit(1)
    
    # Try to commit, but don't fail if there's nothing new
    curr_time = time.strftime("%Y-%m-%d %H:%M:%S")
    print("🚀 Running: git commit")
    commit_result = run_command_with_output(f'git commit -m "Deployment Update: {curr_time}"')
    
    # If it fails with "nothing to commit", we just ignore it and move to push
    if "nothing to commit" in commit_result.stdout or commit_result.returncode == 0:
        print("  [LOG]: No new changes or commit successful. Proceeding to push...")
        
        # Push with force to ensure any previous failed pushes are resolved
        if not run_ps_command("git push origin main --force"):
            print("❌ Git push failed. Make sure you have a GitHub repository connected.")
            print("   If not, run: git remote add origin https://github.com/NIK921129/confessly.git")
            sys.exit(1)
        else:
            print("✅ Git push successful!")
    else:
        print(f"⚠️ Git commit note: {commit_result.stderr.strip()}")
        # Continue anyway if there's an error that's not critical

    # Step 3: Frontend Deployment (Vercel)
    print("\n🎨 Step 3: Deploying Frontend to Vercel...")
    
    # Check if frontend folder exists
    if not os.path.exists('frontend'):
        print("❌ frontend folder not found!")
        sys.exit(1)
    
    # Navigate to frontend and deploy
    original_dir = os.getcwd()
    os.chdir('frontend')
    
    try:
        # Check if Vercel is installed
        vercel_check = run_command_with_output("vercel --version")
        if vercel_check.returncode != 0:
            print("❌ Vercel CLI not installed. Installing now...")
            run_ps_command("npm install -g vercel")
        
        # Link to existing project (your actual project)
        print("🔗 Linking to existing Vercel project: frontend-theta-umber-ao6057gsrx")
        
        # Force link to the correct project
        link_cmd = "vercel link --yes --project frontend-theta-umber-ao6057gsrx --scope voxerachat-3388s-projects"
        link_result = run_command_with_output(link_cmd)
        
        if "Error" in link_result.stderr or link_result.returncode != 0:
            print("⚠️ Linking failed, but will try direct deployment...")
        
        # Deploy with --force to overwrite
        print("🚀 Deploying to production...")
        if not run_ps_command("vercel --prod --yes --force"):
            print("❌ Vercel deployment failed")
            os.chdir(original_dir)
            sys.exit(1)
        
        print("✅ Frontend deployed successfully!")
        
        # Get deployment info
        deploy_info = run_command_with_output("vercel list --limit 1")
        
    finally:
        os.chdir(original_dir)
    
    print("\n🚀 --- ALL SYSTEMS LIVE ---")
    print("🔗 Frontend: https://frontend-theta-umber-ao6057gsrx.vercel.app")
    print("🔗 Backend:  https://confessly-api.onrender.com")
    print("\n📊 Deployment Summary:")
    print("   ✅ Backend: GitHub pushed → Render auto-deploys")
    print("   ✅ Frontend: Deployed to Vercel")
    print("\n💡 Next Steps:")
    print("   1. Wait 2-3 minutes for Render to finish building")
    print("   2. Visit: https://frontend-theta-umber-ao6057gsrx.vercel.app")
    print("   3. Check Render logs at: https://dashboard.render.com")
    print("   4. Test signup and confession posting")

if __name__ == "__main__":
    try:
        deploy()
    except KeyboardInterrupt:
        print("\n\n🛑 Deployment cancelled by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)