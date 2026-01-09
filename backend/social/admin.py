from django.contrib import admin
from social.models import UserPost, UserComment
# Register your models here.
admin.site.register(UserPost)
admin.site.register(UserComment)