from django.db import models
from accounts import models as acc_models

# Create your models here.
class UserPost(models.Model):
    user = models.ForeignKey(acc_models.User, on_delete=models.CASCADE)
    post_desc = models.TextField()
    imageurl = models.ImageField(upload_to='user_posts', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s post - {self.created_at}"