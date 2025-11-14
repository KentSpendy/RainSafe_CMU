from django.core.management.base import BaseCommand
from users.models import CustomUser


class Command(BaseCommand):
    help = 'Create an admin user for RainSafe application'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Admin email address')
        parser.add_argument('password', type=str, help='Admin password')
        parser.add_argument('--first-name', type=str, default='Admin', help='First name (default: Admin)')
        parser.add_argument('--last-name', type=str, default='User', help='Last name (default: User)')

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
            self.stdout.write(
                self.style.WARNING('💡 To make an existing user an admin, use Django shell:')
            )
            self.stdout.write(
                self.style.WARNING(f'   user = CustomUser.objects.get(email="{email}")')
            )
            self.stdout.write(
                self.style.WARNING('   user.role = "admin"')
            )
            self.stdout.write(
                self.style.WARNING('   user.save()')
            )
            return

        try:
            # Create admin user
            admin = CustomUser.objects.create_user(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role='admin'
            )

            self.stdout.write(
                self.style.SUCCESS('✅ Admin user created successfully!')
            )
            self.stdout.write(
                self.style.SUCCESS(f'   Email: {admin.email}')
            )
            self.stdout.write(
                self.style.SUCCESS(f'   Name: {admin.first_name} {admin.last_name}')
            )
            self.stdout.write(
                self.style.SUCCESS(f'   Role: {admin.role}')
            )
            self.stdout.write('')
            self.stdout.write(
                self.style.WARNING('⚠️  Remember to change the password in production!')
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error creating admin user: {str(e)}')
            )
