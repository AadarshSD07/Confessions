#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SocialStack.settings')
django.setup()

from accounts.models import Role

def create_roles():
    roles = [
        {'name': 'admin', 'description': 'Permission for everything in this project. Creator, Destroyer, Owner of the project.'},
        {'name': 'user', 'description': 'permission for selected pages and functionality of the project. Can only experience the project based on creation of admin.'}
    ]
    
    for role_data in roles:
        role, created = Role.objects.get_or_create(name=role_data["name"], description=role_data["description"])
        if created:
            print(f"Created role: {role.name}")
        else:
            print(f"Role {role.name} already exists")

if __name__ == "__main__":
    create_roles()
