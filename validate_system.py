"""
Validation script to verify the MANTRIQ mentor system is properly set up.
Run this before starting the server to ensure all components are working.
"""

import sys
import os

# Add project root to path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)

def validate_dependencies():
    """Check all required dependencies are installed."""
    print("✓ Checking dependencies...")
    
    required = [
        ("Flask", "flask"),
        ("Flask-CORS", "flask_cors"),
        ("LangChain Ollama", "langchain_ollama"),
        ("LangChain Core", "langchain_core"),
    ]
    
    missing = []
    for name, module in required:
        try:
            __import__(module)
            print(f"  ✓ {name}")
        except ImportError:
            print(f"  ✗ {name} - MISSING")
            missing.append(name)
    
    if missing:
        print(f"\n✗ Missing dependencies: {', '.join(missing)}")
        print("Run: pip install -r requirements.txt")
        return False
    
    return True


def validate_database():
    """Check database initialization works."""
    print("\n✓ Checking database...")
    
    try:
        import mentor_db as db
        
        # Initialize database
        db.init_db()
        print("  ✓ Database schema created")
        
        # Seed challenges
        db.seed_challenges()
        print("  ✓ Challenge templates seeded")
        
        # Bootstrap learner
        learner = db.bootstrap_learner()
        print(f"  ✓ Learner profile created (ID: {learner['id']})")
        
        # Check we can query challenges
        challenges = db.get_challenge_templates()
        print(f"  ✓ {len(challenges)} challenges available")
        
        # Check proficiencies
        profs = db.get_language_proficiencies(learner["id"])
        print(f"  ✓ Proficiency tracking ready")
        
        return True
    except Exception as e:
        print(f"  ✗ Database error: {e}")
        return False


def validate_mentor_service():
    """Check mentor service initializes."""
    print("\n✓ Checking mentor service...")
    
    try:
        from mentor_service import get_mentor_service
        import mentor_db as db
        
        service = get_mentor_service()
        learner = db.bootstrap_learner()
        service.set_learner(learner["id"])
        print("  ✓ Mentor service initialized")
        
        # Test context building
        context = service.get_learner_context_block()
        print("  ✓ Learner context generation works")
        
        return True
    except Exception as e:
        print(f"  ✗ Mentor service error: {e}")
        return False


def validate_flask_imports():
    """Check Flask app can be imported."""
    print("\n✓ Checking Flask app...")
    
    try:
        # This will trigger database initialization
        import server
        print("  ✓ Flask app imports successfully")
        print("  ✓ All routes registered")
        return True
    except Exception as e:
        print(f"  ✗ Flask app error: {e}")
        return False


def main():
    print("=" * 60)
    print("MANTRIQ Mentor System - Validation")
    print("=" * 60)
    
    checks = [
        ("Dependencies", validate_dependencies),
        ("Database", validate_database),
        ("Mentor Service", validate_mentor_service),
        ("Flask App", validate_flask_imports),
    ]
    
    results = []
    for name, check_fn in checks:
        try:
            result = check_fn()
            results.append((name, result))
        except Exception as e:
            print(f"✗ Unexpected error in {name}: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 60)
    print("Validation Summary:")
    print("=" * 60)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
    
    all_passed = all(result for _, result in results)
    
    if all_passed:
        print("\n✓ All checks passed! System is ready to run.")
        print("\nStart the server with: python server.py")
        return 0
    else:
        print("\n✗ Some checks failed. Please fix the issues above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
