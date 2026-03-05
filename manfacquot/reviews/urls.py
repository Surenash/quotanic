from django.urls import path
from .views import ReviewListCreateView, ReviewDetailView

# These patterns are included under /api/manufacturers/{manufacturer_id}/
manufacturer_specific_review_urlpatterns = [
    path('', ReviewListCreateView.as_view(), name='manufacturer-review-list-create'),
]

# These patterns are included under /api/
urlpatterns = [
    path('reviews/<uuid:id>/', ReviewDetailView.as_view(), name='review-detail'),
]
