# How to Create an Admin User

## Method 1: Django Shell (Quickest)

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Activate your virtual environment** (if you have one):
```bash
# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Open Django shell:**
```bash
python manage.py shell
```

4. **Run these commands in the shell:**
```python
from users.models import CustomUser

# Create admin user
admin = CustomUser.objects.create_user(
    email='admin@rainsafe.com',
    password='admin123',  # Change this!
    first_name='Admin',
    last_name='User',
    role='admin'
)

print(f"✅ Admin user created: {admin.email}")
exit()
```

5. **Test login** with:
   - Email: `admin@rainsafe.com`
   - Password: `admin123`

---

## Method 2: Django Management Command (Recommended)

Create a reusable command to create admin users anytime.

### Step 1: Create the management command file

**File:** `backend/users/management/commands/createadmin.py`

```python
from django.core.management.base import BaseCommand
from users.models import CustomUser


class Command(BaseCommand):
    help = 'Create an admin user'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Admin email address')
        parser.add_argument('password', type=str, help='Admin password')
        parser.add_argument('--first-name', type=str, default='Admin', help='First name')
        parser.add_argument('--last-name', type=str, default='User', help='Last name')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        # Check if user already exists
        if CustomUser.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.ERROR(f'❌ User with email {email} already exists!')
            )
            return

        # Create admin user
        admin = CustomUser.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role='admin'
        )

        self.stdout.write(
            self.style.SUCCESS(f'✅ Admin user created successfully: {admin.email}')
        )
```

### Step 2: Create required directories (if they don't exist)

```bash
cd backend/users
mkdir -p management/commands
touch management/__init__.py
touch management/commands/__init__.py
```

### Step 3: Use the command

```bash
python manage.py createadmin admin@rainsafe.com admin123
```

Or with custom name:
```bash
python manage.py createadmin admin@rainsafe.com admin123 --first-name John --last-name Doe
```

---

## Method 3: Update Existing User to Admin

If you already have a user account and want to make it admin:

### Using Django Shell:
```bash
python manage.py shell
```

```python
from users.models import CustomUser

# Find the user by email
user = CustomUser.objects.get(email='existing@email.com')

# Change role to admin
user.role = 'admin'
user.save()

print(f"✅ {user.email} is now an admin")
exit()
```

### Using SQL (if you have database access):
```sql
UPDATE users_customuser
SET role = 'admin'
WHERE email = 'existing@email.com';
```

---

## Quick Reference

| Method | Speed | Reusable | Complexity |
|--------|-------|----------|------------|
| Django Shell | ⚡ Fastest | ❌ No | ⭐ Easy |
| Management Command | 🔧 Medium | ✅ Yes | ⭐⭐ Medium |
| Update Existing | ⚡ Fast | ❌ No | ⭐ Easy |

---

## Troubleshooting

### Error: "No such table: users_customuser"
**Solution:** Run migrations first
```bash
python manage.py migrate
```

### Error: "Email already exists"
**Solution:** Either delete the existing user or use Method 3 to update them

### Can't activate virtual environment
**Solution:** Check if venv exists
```bash
# If not, create it
python -m venv venv
```

---

## Security Note

⚠️ **IMPORTANT**: Change the default password after testing! Never use `admin123` in production.

To change password via Django shell:
```python
from users.models import CustomUser
user = CustomUser.objects.get(email='admin@rainsafe.com')
user.set_password('new_secure_password')
user.save()
```
