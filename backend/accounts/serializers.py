from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import ValidationError

User = get_user_model()

class ProfileInformationSerializer(serializers.Serializer):
    username=serializers.CharField(required=True, write_only=True)
    first_name = serializers.CharField(required=True, write_only=True)
    last_name = serializers.CharField(required=True, write_only=True)
    email = serializers.CharField(required=True, write_only=True, allow_blank=True)
    imageUrl = serializers.CharField(required=True, write_only=True, allow_null=True)

    def get(self, user_instance=None):
        """
        Retrieve user profile information.
        """
        if user_instance is None:
            raise ValueError("User instance is required")

        data = {}
        serializer_fields = self.get_fields()
        for field_name, field_instance in serializer_fields.items():
            # Handle regular fields that exist on user_instance
            if hasattr(user_instance, field_name):
                value = getattr(user_instance, field_name)

                # Convert value using field's representation if available
                if hasattr(field_instance, 'to_representation'):
                    value = field_instance.to_representation(value)

            # Handle special case for imageUrl
            elif field_name == 'imageUrl':
                default_image = "/media/user_profile_images/default-user-image.png"
                try:
                    # Get the first userprofile if exists
                    user_profile = user_instance.userprofile_set.first()
                    if user_profile and user_profile.image:
                        value = user_profile.image.url
                except (AttributeError, ObjectDoesNotExist) as e:
                    # Log the error if needed
                    # import logging
                    # logging.warning(f"Error fetching profile image: {e}")
                    value = default_image

            # Handle other non-existent fields
            else:
                # Provide a more informative message
                value = f"Field '{field_name}' does not exist on User model"

            data[field_name] = value
        return data

    def post(self, user_instance, post_data):
        """
        Update user profile information.
        """
        if user_instance is None:
            raise ValueError("User instance is required")

        if not post_data:
            raise ValueError("Data is required to store in user details")

        serializer_fields = self.get_fields()
        updated_fields = []
        program_exception = None

        for field_name, field_instance in serializer_fields.items():
            # Skip if field not in post_data
            if field_name not in post_data:
                continue

            value = post_data[field_name]
            if not value:
                continue

            # Handle special fields
            if field_name == 'imageUrl':
                try:
                    user_profile = user_instance.userprofile_set.first()
                    if user_profile:
                        # Assuming value is a file path or URL
                        # You need to implement actual image saving logic
                        # user_profile.image = value
                        user_profile.save()
                        updated_fields.append(field_name)
                except Exception as e:
                    # Log error
                    print(f"Error updating image: {e}")
                    program_exception = f"Error updating image: {e}"
                continue

            # Handle regular fields
            if hasattr(user_instance, field_name):
                # Validate the value before setting
                try:
                    # You could add field-specific validation here
                    if getattr(user_instance, field_name) == value:
                        continue

                    if field_name == 'email':
                        import pdb; pdb.set_trace()
                        # Basic email validation
                        if '@' not in value:
                            raise ValueError(f"Invalid email format: {value}")

                    setattr(user_instance, field_name, value)
                    updated_fields.append(field_name)
                except Exception as e:
                    # Log the error but continue with other fields
                    print(f"Error setting field {field_name}: {e}")
                    program_exception = f"Error setting field {field_name}: {e}"

        # Save the user instance only once with all changes
        if updated_fields:
            try:
                user_instance.save()
                print(f"Successfully updated fields: {updated_fields}")
            except Exception as e:
                print(f"Error saving user instance: {e}")
                program_exception = f"Error saving user instance: {e}"
                return False

        if program_exception:
            return program_exception
        return True

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "New passwords don't match."})
        
        # Validate password strength
        validate_password(attrs['new_password'])
        
        return attrs

class ResetPasswordEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class ResetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)
    token = serializers.CharField(required=True)
    uid = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords don't match."})
        
        validate_password(attrs['new_password'])
        return attrs